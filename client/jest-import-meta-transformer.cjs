const ts = require('typescript');

function importMetaToGlobalThisTransformer() {
  return (context) => {
    const visit = (node) => {
      if (
        ts.isMetaProperty(node) &&
        node.keywordToken === ts.SyntaxKind.ImportKeyword &&
        node.name.text === 'meta'
      ) {
        return ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('globalThis'),
          '__JEST_IMPORT_META__'
        );
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => ts.visitNode(sourceFile, visit);
  };
}

module.exports = {
  name: 'import-meta-to-globalthis',
  version: 1,
  factory: importMetaToGlobalThisTransformer
};
