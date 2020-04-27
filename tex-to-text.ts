// @ts-ignore: 1375
//
// run like `deno --allow-read --allow-write tex-to-text.ts --infile <<path-to-tex-file>>`
// repro note: works like this: `deno --allow-net --allow-read --allow-write /d/workspace/github/deno-utility-tex-to-text/tex-to-text.ts --infile /d/workspace/github/research-dissertation-case-for-alt-ed/papers/student-debt-history/blinded-student-debt-history.tex`
//
// this utility will output a .txt file as a sibling of the tex file which was input
//
// built with
//    deno: "0.41.0"
//
// TODO: follow up on this issue: https://github.com/denoland/deno/issues/4915

const { args } = Deno;
import { BufReader, ReadLineResult } from "https://deno.land/std/io/bufio.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const EOL = path.EOL;

const handleLine = (sLine: string, bPriorLineEmpty: boolean): [string, boolean] => {
    // const sCleaned = [sLine].map(s => s.replace(/\\cite\{[\w]*}/g,''))[0];
    // const isComment = sCleaned.trim()[0] === "%";
    // const isOmittedFromTextVersion = sCleaned.includes('%%%'); // a convention
    // const isTechnical = sCleaned.trim()[0] === "\\" || sCleaned.trim()[0] === "}";
    // const regexMatchIsSectionHeading = sCleaned.match(/\\[a-z]*section{(?<headingText>[A-z- ]*)}/);
    // const bCurrentLineEmpty = !sCleaned.trim().length;

    // if (bCurrentLineEmpty && !bPriorLineEmpty) {
    //     return [EOL, true];
    // } else if (!bCurrentLineEmpty && !isComment && !isTechnical && !isOmittedFromTextVersion) {
    //     const bEndsWithComma = sCleaned[sCleaned.length-1] === ',';
    //     return [bEndsWithComma ? sCleaned.trim() + ' ' : sCleaned.trim() + EOL, false];
    // } else if(regexMatchIsSectionHeading) {
    //     const headingText = regexMatchIsSectionHeading.groups && regexMatchIsSectionHeading.groups.headingText;
    //     if (headingText) return [bPriorLineEmpty ? headingText.trim() + EOL : EOL + headingText.trim() + EOL, true];
    // }

    // return ['', bPriorLineEmpty];
    return ['', false];
}

export async function read_line(filename: string, lineCallback: (sCurrentLine: string, bPriorLineWasEmpty: boolean) => [string, boolean]): Promise<string> {
  const file = await Deno.open(filename);
  // const bufReader = new BufReader(file);
  // let bAllowLineBreak = false;
  // let sAccumulator = '';
  // let sCurrentProcessedLine = '';
  // let readlineResult: ReadLineResult | Deno.EOF;

  // while ((readlineResult = await bufReader.readLine()) !== Deno.EOF) {
  //   const sCurrentLine = decoder.decode(readlineResult.line);
  //   [sCurrentProcessedLine, bAllowLineBreak] = lineCallback(sCurrentLine, bAllowLineBreak);
  //   sAccumulator += sCurrentProcessedLine;
  // }

  file.close();
  // return sAccumulator;
  return Promise.resolve('fake typed result');
}

const parsedArgs = parse(args);
const inpath = parsedArgs.infile;
const outpath = inpath && inpath.replace('.tex', '.txt');

if (inpath && outpath) {
  // const normalizedInpath = new URL(inpath, import.meta.url).pathname;
  const sOut = await read_line(inpath, handleLine);
  // await Deno.writeFile(outpath, encoder.encode(sOut));
  console.log('hai')
} else {
  console.log('failed to parse infile, inpath, or outpath.')
}

export {}
