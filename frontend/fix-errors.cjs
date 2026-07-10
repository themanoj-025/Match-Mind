const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [target, replacement] of replacements) {
        content = content.replace(target, replacement);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. AchievementsPage
const achPath = path.join(__dirname, 'src/pages/AchievementsPage.tsx');
let achContent = fs.readFileSync(achPath, 'utf8');
achContent = achContent.replace(/rarity=\{badge\.rarity\}/g, 'rarity={badge.rarity as any}');
fs.writeFileSync(achPath, achContent, 'utf8');

// 2. QuickChatFeed
const qcfPath = path.join(__dirname, 'src/components/QuickChatFeed.tsx');
let qcfContent = fs.readFileSync(qcfPath, 'utf8');
qcfContent = qcfContent.replace(/setMessages\(\(prev\) =>/g, 'setMessages((prev: any[]): any[] =>');
fs.writeFileSync(qcfPath, qcfContent, 'utf8');

// 3. AuctionRoomPage
const arPath = path.join(__dirname, 'src/pages/AuctionRoomPage.tsx');
let arContent = fs.readFileSync(arPath, 'utf8');
arContent = arContent.replace(/setCurrentAuctionState\(\(prev: any\) =>/g, 'setCurrentAuctionState((prev: any): any =>');
fs.writeFileSync(arPath, arContent, 'utf8');

// 4. HeroSceneImpl
const heroPath = path.join(__dirname, 'src/components/three/HeroSceneImpl.tsx');
if (fs.existsSync(heroPath)) {
    let heroContent = fs.readFileSync(heroPath, 'utf8');
    heroContent = heroContent.replace(/color\./g, 'color?.');
    heroContent = heroContent.replace(/geometry\.attributes\.position\./g, 'geometry.attributes.position?.');
    fs.writeFileSync(heroPath, heroContent, 'utf8');
}

// 5. TierBadge
const tierPath = path.join(__dirname, 'src/components/TierBadge.tsx');
if (fs.existsSync(tierPath)) {
    let tierContent = fs.readFileSync(tierPath, 'utf8');
    tierContent = tierContent.replace(/const config = tierConfig\[tier\]/g, 'const config = tierConfig[tier] || tierConfig["BRONZE"]');
    fs.writeFileSync(tierPath, tierContent, 'utf8');
}

// 6. TournamentThemeWrapper
const ttPath = path.join(__dirname, 'src/components/TournamentThemeWrapper.tsx');
if (fs.existsSync(ttPath)) {
    let ttContent = fs.readFileSync(ttPath, 'utf8');
    ttContent = ttContent.replace(/color1={t\.color1}/g, 'color1={t.color1 || ""}');
    ttContent = ttContent.replace(/color2={t\.color2}/g, 'color2={t.color2 || ""}');
    ttContent = ttContent.replace(/color3={t\.color3}/g, 'color3={t.color3 || ""}');
    fs.writeFileSync(ttPath, ttContent, 'utf8');
}

// 7. useApi.test.ts
const uaPath = path.join(__dirname, 'src/hooks/useApi.test.ts');
if (fs.existsSync(uaPath)) {
    let uaContent = fs.readFileSync(uaPath, 'utf8');
    uaContent = uaContent.replace(/let mockResponse: { status: number; jsonBody\?: unknown } \| undefined/g, 'let mockResponse: { status: number; jsonBody?: unknown } = { status: 200 }');
    uaContent = uaContent.replace(/mockResponse\.status/g, 'mockResponse!.status');
    uaContent = uaContent.replace(/mockResponse\.jsonBody/g, 'mockResponse!.jsonBody');
    fs.writeFileSync(uaPath, uaContent, 'utf8');
}

// 8. ProfilePage
const ppPath = path.join(__dirname, 'src/pages/ProfilePage.tsx');
if (fs.existsSync(ppPath)) {
    let ppContent = fs.readFileSync(ppPath, 'utf8');
    ppContent = ppContent.replace(/unfollowMutation\.mutate\(userId\)/g, 'unfollowMutation.mutate(userId as string)');
    fs.writeFileSync(ppPath, ppContent, 'utf8');
}

// 9. useStore.test.ts
const usPath = path.join(__dirname, 'src/store/useStore.test.ts');
if (fs.existsSync(usPath)) {
    let usContent = fs.readFileSync(usPath, 'utf8');
    usContent = usContent.replace(/userId:/g, 'user: { name: "Test", avatar: "" }, //');
    usContent = usContent.replace(/type: 'text',/g, '');
    usContent = usContent.replace(/messages\.map/g, 'messages!.map');
    usContent = usContent.replace(/messages\?\.map/g, 'messages!.map');
    fs.writeFileSync(usPath, usContent, 'utf8');
}

console.log("Done");
