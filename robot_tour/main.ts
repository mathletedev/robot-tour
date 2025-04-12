// target time in seconds
const TARGET_TIME = 200;
// robot code
const CODE = `
UP 1
UP 1
UP 2
DOWN 1
LEFT 1
`;

// ---- BEGIN CONFIG ----
const TIME_UNIT = 1120;
const TIME_RIGHT = 330;
const TIME_LEFT = 350;
const TIME_PAUSE = -1;
// ---- END CONFIG ----

// ---- BEGIN COMPILER ----
const parseDir = (dir: string) => {
    switch (dir) {
        case "up":
            return 0;
        case "right":
            return 1;
        case "down":
            return 2;
        case "left":
            return 3;
    }
    return -1;
};

const compile = (code: string) => {
    let gen: number[][] = [];
    let currDir = 0;
    let totalTime = 0;
    let numPauses = 0;

    const write = (time: number, instruction: number) => {
        gen.push([time, instruction]);
        if (time === -1) {
            numPauses++;
        } else {
            totalTime += time;
        }
    };

    write(1000, 0);

    for (const line of code.split("\n")) {
        if (line.trim() === "") {
            continue;
        }

        const xs = line.split(" ");
        const dir = parseDir(xs[0].toLowerCase());
        const mag = parseFloat(xs[1]);

        if (dir !== currDir) {
            if (Math.abs(dir - currDir) == 2) {
                // turn 180
                write(TIME_RIGHT, 2);
                write(TIME_PAUSE, 0);
                write(TIME_RIGHT, 2);
                write(TIME_PAUSE, 0);
            } else if ((dir - currDir + 4) % 4 == 1) {
                // turn right
                write(TIME_RIGHT, 2);
                write(TIME_PAUSE, 0);
            } else {
                // turn left
                write(TIME_LEFT, 3);
                write(TIME_PAUSE, 0);
            }
        }

        write(Math.round(mag * TIME_UNIT), 1);
        write(TIME_PAUSE, 0);

        currDir = dir;
    }

    let bufferTime = Math.round((TARGET_TIME * 1000 - totalTime) / numPauses);
    bufferTime = Math.max(bufferTime, 200);
    bufferTime = Math.min(bufferTime, 2000);

    gen = gen.map((line) => [line[0] !== -1 ? line[0] : bufferTime, line[1]]);

    return gen;
};

const asm: number[][] = compile(CODE);
// ---- END COMPILER ----

// ---- BEGIN RUNNER ----
let i = 0;
let prevTime = input.runningTime();
let running = false;

input.onButtonPressed(Button.A, () => {
    i = 0;
    running = true;
    prevTime = input.runningTime();
});

input.onButtonPressed(Button.B, () => {
    motion.stop();
    running = false;
});

basic.forever(() => {
    if (!running) {
        return;
    }

    if (input.runningTime() > prevTime + asm[i][0]) {
        // go to next command
        prevTime = input.runningTime();
        i++;
    }

    if (i >= asm.length) {
        motion.stop();
        running = false;
        return;
    }

    switch (asm[i][1]) {
        case 0:
            motion.stop();
            break;
        case 1:
            motion.driveStraight(-20);
            break;
        case 2:
            motion.turnRight(-10);
            break;
        case 3:
            motion.turnLeft(-10);
            break;
        default:
            motion.stop();
            break;
    }
});
// ---- END RUNNER ----
