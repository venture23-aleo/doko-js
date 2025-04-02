npx wasm-pack build --target nodejs --out-dir dist/pkg-node --no-pack --release 
npx wasm-pack build --target web --out-dir dist/pkg-web --no-pack --release
npx wasm-pack build --target bundler --out-dir dist/pkg-bundler --no-pack --release
mv dist/pkg-node/wasm.js dist/pkg-node/wasm.cjs 
rm dist/**/.gitignore