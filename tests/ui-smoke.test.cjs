'use strict';
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

test('Browser-like career flow renders new hub, detailed stats, training choice and lifestyle shop',()=>{
 const errors=[];
 const virtualConsole=new VirtualConsole();
 virtualConsole.on('jsdomError',err=>errors.push(err.message));
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://nine-innings.test/',
   virtualConsole,pretendToBeVisual:true,beforeParse(win){win.scrollTo=function(){};}});
 const doc=dom.window.document;
 function action(name){
   const el=doc.querySelector('[data-action="'+name+'"]');
   assert.ok(el,'Action exists: '+name);
   el.click();
 }
 action('new-game');
 const name=doc.getElementById('input-name');
 name.value='브라우저테스트';
 name.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 const batter=doc.querySelector('[data-action="choose-position"][data-pos="batter"]');
 assert.ok(batter);
 batter.click();
 action('confirm-create');
 action('start-hs-season');
 action('go-to-draft');
 const entry=doc.querySelector('[data-action="start-pro-career"]')||doc.querySelector('[data-action="sign-developmental"]');
 assert.ok(entry,'Draft or developmental team offer');
 entry.click();
 const close=doc.querySelector('[data-action="close-debut-announce"]');
 if(close)close.click();
 assert.ok(!doc.getElementById('screen-hub').classList.contains('hidden'));
 assert.equal(doc.querySelectorAll('.tab-btn').length,6);
 assert.equal(doc.querySelectorAll('#player-card .skill').length,5);
 assert.ok(doc.querySelector('#player-card .team-logo-slot'),'Team logo slot in player card');
 assert.equal(doc.querySelectorAll('#tab-home .mindset-item').length,3,'Morale, clubhouse and fan states');
 doc.querySelector('.tab-btn[data-tab="growth"]').click();
 assert.ok(doc.querySelectorAll('#tab-growth .skill').length===5);
 const focus=doc.querySelector('[data-action="set-growth-focus"][data-focus="defense"]');
 assert.ok(focus,'Manual focus choice present');
 focus.click();
 assert.ok(doc.querySelector('[data-action="set-growth-focus"][data-focus="defense"]').classList.contains('selected'));
 doc.querySelector('.tab-btn[data-tab="life"]').click();
 assert.ok(!doc.getElementById('tab-life').classList.contains('hidden'));
 assert.ok(doc.querySelectorAll('#tab-life .life-item').length>=13);
 assert.ok(doc.querySelectorAll('#tab-life .life-art-slot').length>=13,'Item artwork slots');
 assert.ok(doc.getElementById('tab-life').textContent.includes('사용 가능 금액'));
 assert.deepEqual(errors,[],'Browser javascript errors');
 dom.window.close();
});