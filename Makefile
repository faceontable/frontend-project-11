install:
	npm ci --include=dev

develop:
	npm run dev

lint:
	npx eslint .

build:
	NODE_ENV=production npm run build

test:
	echo no tests
