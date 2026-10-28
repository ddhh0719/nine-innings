'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test');
const assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const found=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(found,'game script exists');
const js=found[1],end=js.indexOf("  document.addEventListener('click', function(e){");
assert.ok(end>0);
const output=js.slice(0,end)+"\n globalThis.__gameTests={BATTER_SUBROLES,PITCHER_SUBROLES,currentPlayRole,buildPositionPlayEvent,buildClutchMomentEvent,isPositionEventEligible,simulateBatterSeason,simulatePitcherSeason,recomputeBatterDerived,recomputePitcherDerived,simulatePostseasonBracket,TEAMS,LIFE_SHOP,purchaseLifeItem,recordSeasonFanPosts,renderFanPosts,POSITION_PLAY_VARIATIONS,CAREER_GOALS,autoAssignGrowthFocus,seasonMindset,teamLogoHtml,renderEventVisual,lifeItemArt,careerArt};\n})();";
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

test('Three role-correct scenarios for each of the 12 positions',()=>{
 for(const role of roles){
  const situations=new Set();
  for(let i=0;i<90;i++){
   const p=mk(role),ev=g.buildPositionPlayEvent(p);
   const prompt=ev.prompt(p);
   situations.add(prompt.split(' · ').slice(-1)[0]);
   assert.ok(prompt.includes(role));
   assert.equal(ev.choices.length,3);
  }
  assert.ok(situations.size>=3,role+' should have multiple scenes');
 }
});
test('Lifestyle shop deducts money and excludes incorrect positions',()=>{
 const p=mk('유격수');
 p.wallet=10000;p.totalEarnings=10000;p.ownedEquipment=[];p.lifeActionsYear={};p.lifeLedger=[];p.fanFeed=[];
 const before=p.stats.defense;
 assert.equal(g.purchaseLifeItem(p,'glove'),true);
 assert.equal(p.wallet,8400);
 assert.equal(p.stats.defense,before+2);
 assert.equal(p.totalEarnings,10000);
 assert.equal(g.purchaseLifeItem(p,'glove'),false);
 assert.equal(g.purchaseLifeItem(p,'pitchlab'),false);
 assert.equal(g.purchaseLifeItem(p,'fanmeet'),true);
 assert.equal(g.purchaseLifeItem(p,'fanmeet'),false);
 p.careerYears++;
 assert.equal(g.purchaseLifeItem(p,'fanmeet'),true);
 const t=mk('선발');t.wallet=10000;t.totalEarnings=10000;t.lifeLedger=[];t.ownedEquipment=[];t.lifeActionsYear={};
 assert.equal(g.purchaseLifeItem(t,'bat'),false);
 assert.equal(g.purchaseLifeItem(t,'pitchshoes'),true);
 assert.equal(t.stats.stamina,71);
 assert.ok(g.LIFE_SHOP.length>=15);
});
test('Community posts persist when a result screen is rerendered',()=>{
 const p=mk('유격수');
 p.wallet=2000;p.totalEarnings=2000;p.fanFeed=[];p.lifeLedger=[];p.ownedEquipment=[];p.lifeActionsYear={};
 g.recordSeasonFanPosts(p,{ops:.912,hr:27,errors:3,avg:.295},['골든글러브']);
 const feed=g.renderFanPosts(p,8);
 assert.ok(feed.includes('community-post'));
 assert.ok(p.fanFeed.length>=3);
 assert.equal(g.renderFanPosts(p,8),feed);
});
test('Overseas transfers are disabled and pacing has distinct targets',()=>{
 assert.doesNotMatch(html,/data-choice="overseas"/);
 assert.doesNotMatch(html,/id:'overseas_showcase'|id:'overseas_scouting_offer'/);
 assert.ok(!g.CAREER_GOALS.some(x=>x.id==='overseas_bound'));
 assert.match(js,/quick\?randInt\(1,2\):randInt\(4,5\)/);
});

test('Manual focus is respected and automatic fallback still rotates',()=>{
 const p=mk('유격수');
 p.archetype='balanced';
 p.manualGrowthFocus='defense';
 assert.equal(g.autoAssignGrowthFocus(p),'defense');
 p.manualGrowthFocus=null;
 assert.ok(['power','contact','speed','defense','mental'].includes(g.autoAssignGrowthFocus(p)));
});

test('Morale, clubhouse and fan sentiment only nudge season performance, never raw stats',()=>{
 const p=mk('포수');p.shopSeasonMood=0;p.teamRecord=null;p.teamRank=0;
 assert.equal(g.seasonMindset(p).boost,0);
 const original=JSON.stringify(p.stats);
 p.momentum=1;p.shopSeasonMood=.4;p.teamRank=1;p.teamRecord={wins:110,losses:34};p.fanApproval=100;
 const high=g.seasonMindset(p);
 assert.ok(high.boost>0&&high.boost<=2);
 p.momentum=-1;p.shopSeasonMood=-.4;p.teamRank=10;p.teamRecord={wins:20,losses:124};p.fanApproval=0;
 const low=g.seasonMindset(p);
 assert.ok(low.boost<0&&low.boost>=-2);
 assert.equal(JSON.stringify(p.stats),original);
 assert.match(html,/var focusAttemptsRaw=clamp\(3\.6\+sf\.perf\*1\.5/);
 assert.match(html,/var growthPointsRaw = clamp\(12\.5\+sf\.perf\*7/);
});
test('Uploaded asset slots use predictable filenames without bundled art',()=>{
 assert.match(g.teamLogoHtml('서울 코메츠'),/assets\/images\/teams\/seoul_comets\.webp/);
 assert.match(g.teamLogoHtml('제주 드래곤테일즈'),/assets\/images\/teams\/jeju_dragontails\.webp/);
 assert.match(g.renderEventVisual('trade'),/assets\/images\/categories\/trade\.webp/);
 assert.match(g.renderEventVisual('performance'),/assets\/images\/categories\/performance\.webp/);
 assert.match(g.renderEventVisual('승부처'),/assets\/images\/categories\/performance\.webp/);
 assert.match(g.lifeItemArt({id:'sports_car',type:'luxury'}),/assets\/images\/life\/sports_car\.webp/);
 assert.match(g.careerArt('retirement'),/assets\/images\/career\/retirement\.webp/);
 assert.doesNotMatch(g.careerArt('unknown_scene'),/img/);
});
test('Fan community reacts to actual player season results without near-term repetitions',()=>{
 const p=mk('선발');p.fanFeed=[];p.lifeLedger=[];p.history=[];p.fanApproval=55;
 p.team={name:'대전 볼케이노스'};p.teamRank=2;
 const topics=new Set();
 for(let year=3;year<=8;year++){
  p.careerYears=year;
  let line={ip:168,era:year%2?2.7:5.9,k:175-year*3,bb:34,holds:0,saves:0,wins:12,losses:7};
  p.history.push({year:year, line});
  const posted=g.recordSeasonFanPosts(p,line,year===4?['최우수선수']:[]);
  assert.ok(posted>=1&&posted<=5);
  for(const item of p.fanFeed)topics.add(item.topic);
 }
 const texts=p.fanFeed.map(x=>x.text);
 assert.ok(new Set(texts).size>=15,'More narrative variety than a short canned list');
 assert.ok(topics.size>=5,'Several context-driven story themes');
 assert.ok(texts.slice(-20).every((text,i,arr)=>arr.indexOf(text)===i));
 assert.ok(g.renderFanPosts(p,4).includes('fan-tone'));
 assert.ok(p.fanFeed.every(x=>x.kind==='시즌'));
});

test('Illustrations match four screenshot scenarios with safe fallback',()=>{
 const samples=[
  ['national_team','national_team_call','national_team_call'],
  ['성장 방향','growth_path_choice','growth_path_choice'],
  ['team','coach_change','coach_change'],
  ['performance','pitch_tipping_leak','pitch_tipping_leak']
 ];
 for(const [category,eventId,file] of samples){
  const markup=g.renderEventVisual(category,eventId);
  assert.match(markup,new RegExp('assets/images/events/'+file+'[.]webp'));
  assert.match(markup,/data-fallback-src="assets\/images\/categories\//);
 }
 assert.match(g.renderEventVisual('performance','other'),/assets\/images\/categories\/performance[.]webp/);
 assert.match(html,/renderEventVisual\(ev[.]category,ev[.]id\)/);
});
