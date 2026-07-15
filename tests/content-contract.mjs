import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('Running Content Contract Tests...');

const islandsDir = path.join(process.cwd(), 'src', 'content', 'islands');
const islandDirs = fs.readdirSync(islandsDir);

let lessons = 0;
let activeLevels = 0;
let challenges = 0;
let choices = 0;
let allIds = new Set();

islandDirs.forEach(islandId => {
  const dataPath = path.join(islandsDir, islandId, 'data.json');
  assert(fs.existsSync(dataPath), `Data missing for ${islandId}`);
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  
  lessons++;
  activeLevels += data.activeLevels || data.games.length;
  
  assert(!allIds.has(data.lessonId), 'Duplicate lessonId');
  allIds.add(data.lessonId);
  
  data.games.forEach(g => {
    assert(!allIds.has(g.gameId), 'Duplicate gameId');
    allIds.add(g.gameId);
    if(g.challenges) {
      challenges += g.challenges.length;
      g.challenges.forEach(c => {
        assert(!allIds.has(c.challengeId), `Duplicate challengeId: ${c.challengeId}`);
        allIds.add(c.challengeId);
        
        let choiceIds = new Set();
        if(c.choices) {
          choices += c.choices.length;
          c.choices.forEach(ch => {
            assert(!allIds.has(ch.choiceId), `Duplicate choiceId: ${ch.choiceId}`);
            allIds.add(ch.choiceId);
            choiceIds.add(ch.choiceId);
          });
        }
        if(c.correctChoiceIds) {
          c.correctChoiceIds.forEach(ccid => {
            assert(choiceIds.has(ccid), `Unresolved correctChoiceId: ${ccid}`);
          });
        }
      });
    }
  });
});

assert.strictEqual(lessons, 4, 'Must have exactly 4 lessons');
assert.strictEqual(activeLevels, 18, 'Must have exactly 18 levels');
assert.strictEqual(challenges, 65, 'Must have exactly 65 challenges');
assert.strictEqual(choices, 200, 'Must have exactly 200 choices');

assert(!fs.existsSync(path.join('dev', 'lesson-data-master-fixed.json')), 'Salvaged file still exists');
assert(!fs.existsSync(path.join('dev', 'lesson-data-master-broken.json')), 'Salvaged file still exists');

console.log('PASS: Content contract tests successful.');
