const fs = require('fs');

let content = fs.readFileSync('f:/GITHUB/Match-Mind/backend/prisma/schema.prisma', 'utf8');

// 1. Standardize on UUIDv7
content = content.replace(/@default\(uuid\(\)\)/g, '@default(uuid(7))');

// 2. Add GIN indexes for JSON columns
const models = content.split('model ');
for (let i = 1; i < models.length; i++) {
  let modelStr = models[i];
  const jsonFieldsMatch = [...modelStr.matchAll(/(\w+)\s+Json/g)];
  if (jsonFieldsMatch.length > 0) {
    const jsonFields = jsonFieldsMatch.map(m => m[1]);
    for (const field of jsonFields) {
      if (!modelStr.includes('@@index([' + field + '], type: Gin)')) {
        modelStr = modelStr.replace(/\s*}\s*$/, '\n  @@index([' + field + '], type: Gin)\n}\n');
      }
    }
    models[i] = modelStr;
  }
}
content = models.join('model ');

// 3. Add deletedAt to Player, Fixture, and DraftSession if missing
const addDeletedAt = (modelContent) => {
  if (!modelContent.includes('deletedAt')) {
    modelContent = modelContent.replace(/updatedAt\s+DateTime\s+@updatedAt/, 'updatedAt          DateTime              @updatedAt\n  deletedAt          DateTime?');
    if (!modelContent.includes('@@index([deletedAt])')) {
       modelContent = modelContent.replace(/\s*}\s*$/, '\n  @@index([deletedAt])\n}\n');
    }
  }
  return modelContent;
}

const models2 = content.split('model ');
for (let i = 1; i < models2.length; i++) {
  const modelName = models2[i].split(/\s/)[0];
  if (['Player', 'Fixture', 'DraftSession'].includes(modelName)) {
    models2[i] = addDeletedAt(models2[i]);
  }
}
content = models2.join('model ');

fs.writeFileSync('f:/GITHUB/Match-Mind/backend/prisma/schema.prisma', content);
console.log('Schema updated successfully.');
