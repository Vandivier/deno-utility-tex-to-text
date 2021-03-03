// @ts-ignore: 1375
//
// run like `deno run --allow-read --allow-write tex-to-text.ts --infile <<path-to-tex-file>>`
//  infile can be full or relative, but must follow posix syntax. Use spaces at your own risk. Eg prefer `/c/my-file.tex`.
//  Windows users will enjoy sailhenz.copy-path-linux VS Code plugin to easily copy a file path in a posix syntax.
//
//
// this utility will output a .txt file as a sibling of the tex file which was input
//
// validated with
//    deno: "1.7.5"
//
// TODO: follow up on this issue: https://github.com/denoland/deno/issues/4915
// TODO: this issue https://github.com/denoland/deno/issues/4631

const { args } = Deno;
import { BufReader, ReadLineResult } from "https://deno.land/std/io/bufio.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import {EOL} from "https://deno.land/std/fs/eol.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const handleLine = (sLine: string, bPriorLineEmpty: boolean): [string, boolean] => {
    const sCleaned = [sLine].map(s => s.replace(/\\cite\{[\w]*}/g,''))[0];
    const isComment = sCleaned.trim()[0] === "%";
    const isOmittedFromTextVersion = sCleaned.includes('%%%'); // a convention
    const isTechnical = sCleaned.trim()[0] === "\\" || sCleaned.trim()[0] === "}";
    const regexMatchIsSectionHeading = sCleaned.match(/\\[a-z]*section{(?<headingText>[A-z- ]*)}/);
    const bCurrentLineEmpty = !sCleaned.trim().length;

    if (bCurrentLineEmpty && !bPriorLineEmpty) {
        return [EOL.LF, true];
    } else if (!bCurrentLineEmpty && !isComment && !isTechnical && !isOmittedFromTextVersion) {
        const bEndsWithComma = sCleaned[sCleaned.length-1] === ',';
        return [bEndsWithComma ? sCleaned.trim() + ' ' : sCleaned.trim() + EOL.LF, false];
    } else if(regexMatchIsSectionHeading) {
        const headingText = regexMatchIsSectionHeading.groups && regexMatchIsSectionHeading.groups.headingText;
        if (headingText) return [bPriorLineEmpty ? headingText.trim() + EOL.LF : EOL.LF + headingText.trim() + EOL.LF, true];
    }

    return ['', bPriorLineEmpty];
}

export async function read_line(filename: string, lineCallback: (sCurrentLine: string, bPriorLineWasEmpty: boolean) => [string, boolean]): Promise<string> {
  const file = await Deno.open(filename);
  const bufReader = new BufReader(file);
  let bAllowLineBreak = false;
  let sAccumulator = '';
  let sCurrentProcessedLine = '';
  let readlineResult: ReadLineResult | null;

  while ((readlineResult = await bufReader.readLine()) !== null) {
    const sCurrentLine = decoder.decode(readlineResult.line);
    [sCurrentProcessedLine, bAllowLineBreak] = lineCallback(sCurrentLine, bAllowLineBreak);
    sAccumulator += sCurrentProcessedLine;
  }

  file.close();
  return sAccumulator;
}

const parsedArgs = parse(args);
const infile = parsedArgs.infile;

// If the first segment of `inpath` looks like a drive letter, add a leading slash before URL basing and remove it afterwards.
// ref: https://github.com/denoland/deno/issues/4915#issuecomment-619699680
const normalizedInpath = new URL(infile.replace(/(?=^[A-Z]:[/\/])/, "/"), import.meta.url).pathname.replace(/^\/(?=[A-Z]:\/)/, "");
const outfile = normalizedInpath && normalizedInpath.replace('.tex', '.txt') || '';

if (outfile) {
  const sOut = await read_line(normalizedInpath, handleLine);
  await Deno.writeFile(outfile, encoder.encode(sOut));
} else {
  console.log('Error: Unexpected outfile');
}

export {}
