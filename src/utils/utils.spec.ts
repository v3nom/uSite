import { Utils } from "./utils.js";

describe("usite utils suite", () => {
    it("should parse markdown", () => {
        const content = "# Title";
        const expectedResult = "<h1>Title</h1>\n";
        const result = Utils.parseMarkdown(content);

        expect(result).toBe(expectedResult);
    });

    it("should parse JSON options", () => {
        const input = '{"a":1, "b":"2"}';
        const expectedResult = { a: 1, b: '2' };
        const result = Utils.parseOptions(input);

        expect(result).toEqual(expectedResult);
    });

    it("should parse YAML options", () => {
        const input = `a: 1\nb: Title\n`;
        const expectedResult = { a: 1, b: 'Title' };
        const result = Utils.parseOptions(input);

        expect(result).toEqual(expectedResult);
    });

    it("should generate slug", () => {
        const input = "Article Title";
        const expectedResult = 'article-title';
        const result = Utils.generateSlug(input);

        expect(result).toBe(expectedResult);
    });
});
