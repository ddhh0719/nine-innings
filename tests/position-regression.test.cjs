'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const found=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(found,'game script exists');
const js=found[1],end=js.indexOf("  document.addEventListener('click', function(e){");
assert.ok(end>0);
const output=js.slice(0,end)+"\n globalThis.__gameTests={BATTER_SUBROLES,PITCHER_SUBROLES,currentPlayRole,buildPositionPlayEvent,buildClutchMomentEvent,isPositionEventEligible,simulateBatterSeason,simulatePitcherSeason,recomputeBatterDerived,recomputePitcherDerived,simulatePostseasonBracket,TEAMS};\n})();";
const sandbox={console,Math:Object.create(Math),document:{addEventListener(){}}};
sandbox.Math.random=Math.random;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(output,sandbox,{timeout:2500});
const g=sandbox.__gameTests;
function mk(role){
 const pitcher=g.PITCHER_SUBROLES.includes(role);
 return {name:'테스트 선수',age:25,careerYears:3,position:pitcher?'pitcher':'batter',
 subrole:role==='지명타자'?'1루수':role,isDH:role==='지명타자',
 fanApproval:50,simMode:'realistic',momentum:0,highlights:[],
 stats:pitcher?{velocity:70,control:68,breaking:72,stamina:70,mental:65}
 :{power:66,contact:70,speed:60,defense:75,mental:66}};
}
const roles=['포수','1루수','2루수','3루수','유격수','좌익수','중견수','우익수','지명타자','선발','불펜','마무리'];
test('12 distinct position scenes and legal outcome types',()=>{
 for(const role of roles){
  const p=mk(role),ev=g.buildPositionPlayEvent(p);
  assert.equal(g.currentPlayRole(p),role);
  assert.equal(ev.choices.length,3);
  assert.ok(ev.prompt(p).includes(role));
  for(const ch of ev.choices){
   const pl=mk(role),ctx={lineBoost:{},statBoost:{},injuryRiskDelta:0};
   const msg=ch.resolve(pl,ctx);
   assert.ok(msg.length>=12);
   assert.equal(pl.positionPlayHistory.length,1);
   for(const n of Object.values(ctx.lineBoost))assert.ok(Number.isFinite(n));
   if(pl.position==='pitcher')assert.equal(ctx.lineBoost.hr,undefined);
   if(role==='포수')assert.doesNotMatch(msg,/중견수|우익수|좌익수|우중간 깊은 뜬공/);
  }
 }
});
test('Role conversion suppresses stale positional scenes',()=>{
 const p=mk('포수'),ev=g.buildPositionPlayEvent(p);
 p.subrole='중견수';
 const ctx={lineBoost:{}};
 assert.match(ev.choices[0].resolve(p,ctx),/역할이 변경/);
 assert.equal(Object.keys(ctx.lineBoost).length,0);
});
test('Only infielders receive generic double-play and shift decisions',()=>{
 for(const id of ['risky_double_play','infield_shift_gamble']){
  assert.equal(g.isPositionEventEligible({id},mk('포수')),false);
  assert.equal(g.isPositionEventEligible({id},mk('좌익수')),false);
  assert.equal(g.isPositionEventEligible({id},mk('지명타자')),false);
  assert.equal(g.isPositionEventEligible({id},mk('유격수')),true);
 }
});
test('400 hitter seasons keep hits, home runs, average and OPS coherent',()=>{
 for(let i=0;i<400;i++){
  const line=g.simulateBatterSeason(mk(roles[i%9]),0);
  g.recomputeBatterDerived(line);
  assert.ok(line.games>=0&&line.games<=144);
  assert.ok(line.ab>=line.h&&line.h>=line.hr);
  assert.ok(line.doubles+line.triples+line.hr<=line.h);
  assert.ok(line.k<=line.ab-line.h);
  assert.ok(Math.abs(line.avg-line.h/(line.ab||1))<1e-9);
  assert.ok(Math.abs(line.ops-line.obp-line.slg)<1e-9);
 }
 const bad={ab:9,h:3,hr:11,doubles:9,triples:9,k:100,bb:0,runs:5,rbi:5};
 g.recomputeBatterDerived(bad);
 assert.equal(bad.hr,3);
 assert.equal(bad.h,3);
 assert.ok(bad.doubles+bad.triples+bad.hr<=bad.h);
});
test('240 pitcher seasons use baseball thirds rather than decimal tenths',()=>{
 const sample={games:12,ip:6.1,h:8,bb:2,k:5,er:3,wins:0,losses:0,saves:0,holds:0};
 g.recomputePitcherDerived(sample);
 assert.equal(sample.ip,6.1);
 assert.ok(Math.abs(sample.era-27/(6+1/3))<1e-9);
 for(let i=0;i<240;i++){
  const line=g.simulatePitcherSeason(mk(g.PITCHER_SUBROLES[i%3]),0);
  g.recomputePitcherDerived(line);
  const digit=Math.round((line.ip-Math.floor(line.ip))*10);
  assert.ok([0,1,2].includes(digit));
  assert.ok(line.saves+line.holds<=line.games);
  assert.ok(line.wins+line.losses<=line.games);
 }
});
test('250 postseason ladders obey series lengths and wild-card advantage',()=>{
 const seeds=g.TEAMS.slice(0,5).map((x,i)=>({team:x.name,pct:.60-i*.03}));
 for(let i=0;i<250;i++){
  const b=g.simulatePostseasonBracket(seeds);
  assert.equal(b.rounds.length,4);
  for(const round of b.rounds){
   const needed=round.round==='wildcard'?2:round.round==='koreanseries'?4:3;
   assert.equal(Math.max(round.winsA,round.winsB),needed);
   assert.equal(round.games.length,round.winsA+round.winsB-(round.fourthSeedAdvantage?1:0));
  }
 }
});
