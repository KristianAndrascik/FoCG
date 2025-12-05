export class LevelParser {
    static parse(text) {
        const lines = text.trim().split('\n');
        const height = lines.length;
        const width = lines[0].length;
        const map = [];

        for (let z = 0; z < height; z++) {
            const row = [];
            const line = lines[z].trim();
            for (let x = 0; x < width; x++) {
                const char = line[x];
                if (char === '#') {
                    row.push(1); // Wall
                } else {
                    row.push(0); // Empty
                }
            }
            map.push(row);
        }

        return { width, height, map };
    }
}
