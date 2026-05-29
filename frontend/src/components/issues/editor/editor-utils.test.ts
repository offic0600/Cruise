import { describe, expect, it } from 'vitest';
import { buildEditorCommands } from './commands';
import { normalizeHref, normalizeMarkdown, serializeContentJson } from './utils';

describe('editor utils', () => {
  it('normalizes markdown line endings', () => {
    expect(normalizeMarkdown('a\r\nb\r\n')).toBe('a\nb\n');
  });

  it('normalizes bare links to https', () => {
    expect(normalizeHref('example.com')).toBe('https://example.com');
    expect(normalizeHref('http://example.com')).toBe('http://example.com');
    expect(normalizeHref('')).toBe('');
  });

  it('serializes null-ish json content deterministically', () => {
    expect(serializeContentJson()).toBe('null');
    expect(serializeContentJson(null)).toBe('null');
    expect(serializeContentJson({ type: 'doc' })).toBe('{"type":"doc"}');
  });
});

describe('editor command registry', () => {
  const translator = (key: string) => key;
  const commands = buildEditorCommands(translator);

  it('keeps all Cruise business commands registered', () => {
    expect(commands.map((command) => command.id)).toEqual(
      expect.arrayContaining([
        'attachment',
        'media',
        'gif',
        'diagram',
        'collapsibleSection',
        'subIssue',
        'relatedIssue',
        'projectRelation',
        'documentRelation',
      ]),
    );
  });

  it('keeps text style and slash command entries visible', () => {
    const heading1 = commands.find((command) => command.id === 'heading1');
    const attachment = commands.find((command) => command.id === 'attachment');
    const documentRelation = commands.find((command) => command.id === 'documentRelation');
    expect(heading1?.visibility?.textStyleMenu).toBe(true);
    expect(heading1?.visibility?.slash).toBe(true);
    expect(attachment?.visibility?.toolbar).toBe(true);
    expect(attachment?.visibility?.slash).toBe(true);
    expect(documentRelation?.visibility?.slash).toBe(true);
  });

  it('marks every current command as slash-capable', () => {
    const missingFromSlash = commands
      .filter((command) => !command.visibility?.slash)
      .map((command) => command.id);

    expect(missingFromSlash).toEqual([]);
  });
});
