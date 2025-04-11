all: deploy

build:
	pxt build
	cp ./built/binary.hex /run/media/neo/MICROBIT/

deploy:
	pxt deploy

test:
	pxt test

exec:
	bun main.ts
