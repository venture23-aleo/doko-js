#!/bin/bash

# This script build the core and utils package and host 
# serve it in the localhost. These packages can then be 
# included in other project as a local dependency.

CORE_DIR="packages/core"
UTILS_DIR="packages/utils"
WASM_DIR="packages/wasm/dist"
LIB_DIR="./lib"

rm -rf "$LIB_DIR"

pnpm build

pushd ./ > /dev/null 2>&1
echo "Creating lib for 'core'"
cd "$CORE_DIR" && pnpm pack
popd > /dev/null 2>&1

pushd ./ > /dev/null 2>&1
echo "Creating lib for 'utils'"
cd "$UTILS_DIR" && pnpm pack
popd > /dev/null 2>&1

pushd ./ > /dev/null 2>&1
echo "Creating lib for 'wasm'"
cd "$WASM_DIR" && pnpm pack
popd > /dev/null 2>&1

echo "Creating 'lib' directory"
mkdir -p "$LIB_DIR"

echo "Moving artifacts ..."
mv "$CORE_DIR"/doko-js-core-*.tgz $LIB_DIR
mv "$UTILS_DIR"/doko-js-utils-*.tgz $LIB_DIR
mv "$WASM_DIR"/doko-js-wasm-*.tgz $LIB_DIR


echo "Add following dependencies in package.json"

# We only find the first one and return it, so we must be careful 
# that the folder doesn't contain multiple tgz file
CORE_LIB=$(basename $(find "$LIB_DIR" -name "*core*.tgz" -print -quit))
echo '"@doko-js/core": "http://localhost:3000/'$CORE_LIB'",'

UTILS_LIB=$(basename $(find "$LIB_DIR" -name "*utils*.tgz" -print -quit))
echo '"@doko-js/utils": "http://localhost:3000/'$UTILS_LIB'",'

WASM_LIB=$(basename $(find "$LIB_DIR" -name "*wasm*.tgz" -print -quit))
echo '"@doko-js/wasm": "http://localhost:3000/'$WASM_LIB'",'

printf '\n'
echo "run 'npm install'"

npx serve "$LIB_DIR"
exit 1