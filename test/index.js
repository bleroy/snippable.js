// Snippable.js (c) 2015 Bertrand Le Roy, under MIT. See LICENSE.txt for licensing details.
'use strict';
var expect = require('chai').expect;
var Snippable = require('../index');

describe('Snippable.js', function() {
  it('can register parsers', function() {
    function parser(text, done) {done();}
    var snippable = new Snippable();

    snippable.registerParser('foo', parser);
    expect(snippable.parsers.foo).to.equal(parser);
  });

  it('can natively parse JSON parts', function() {
    var partDocument = '{"foo": 42}';
    var snippable = new Snippable();

    var part = snippable.parsers.json(partDocument);
    expect(part.foo).to.equal(42);
  });

  it('can natively parse YAML parts', function() {
    var partDocument = 'foo: 42\r\nbar: baz baz baz';
    var snippable = new Snippable();

    var part = snippable.parsers.yaml(partDocument);
    expect(part.foo).to.equal(42);
    expect(part.bar).to.equal('baz baz baz');
  });

  it('can get part formats from file extensions', function() {
    var path = 'path/to/document.yaml.json.md';
    var snippable = new Snippable();

    var formats = snippable.getFormatsFromFileName(path);
    expect(formats).to.deep.equal(['yaml', 'json', 'md']);
  });

  it('can split multipart documents', function() {
    var document = 'foo: 42\r\nbar: baz baz baz\r\n\r\n'
      + '-8<--\r\n\r\n'
      + 'Some *markdown*.\r\n\r\n'
      + '-8<--\r\n\r\n'
      + '{"foo": "fou"}';
    var snippable = new Snippable();

    var parts = snippable.parse(document, ['yaml', 'md', 'json']);
    expect(parts).to.deep.equal([
      {foo: 42, bar: 'baz baz baz'},
      'Some *markdown*.',
      {foo: 'fou'}
    ]);
  });

  it("won't split on bad separators", function() {
    var document = 'foo-8<--bar -8<-- baz\r\n\r\n'
      + ' -8<--\r\n\r\n'
      + '-8<-- \r\n\r\n'
      + '-8<-\r\n\r\n'
      + '8<--\r\n\r\n'
      + 'the end';
    var snippable = new Snippable();

    var parts = snippable.parse(document, ['md']);
    expect(parts[0]).to.equal(document);
  });

  it('will split on longer separators', function() {
    var document = 'foo\r\n'
      + '-8<-------------------\r\n'
      + 'bar';
    var snippable = new Snippable();

    var parts = snippable.parse(document, ['md', 'md']);
    expect(parts).to.deep.equal(['foo', 'bar']);
  });

  it('will yield YAML and strings if no format is specified', function() {
    var document = 'foo: bar\r\n'
      + '-8<--\r\n'
      + 'bar';
    var snippable = new Snippable();

    var parts = snippable.parse(document);
    expect(parts).to.deep.equal([{foo: 'bar'}, 'bar']);
  });

  it('can use a path to infer part formats', function() {
    var document = 'foo: 42\r\nbar: baz baz baz\r\n\r\n'
      + '-8<--\r\n\r\n'
      + 'Some *markdown*.\r\n\r\n'
      + '-8<--\r\n\r\n'
      + '{"foo": "fou"}';
    var snippable = new Snippable();

    var parts = snippable.parse(document, 'path/to/documant.yaml.md.json');
    expect(parts).to.deep.equal([
      {foo: 42, bar: 'baz baz baz'},
      'Some *markdown*.',
      {foo: 'fou'}
    ]);
  });

  it('can get formats from separators', function() {
    var document = 'foo: 42\r\nbar: baz baz baz\r\n\r\n'
      + '-8<--^-yaml--\r\n\r\n'
      + 'Some *markdown*.\r\n\r\n'
      + '-8<--^-md--v-json--\r\n\r\n'
      + '{"foo": "fou"}\r\n'
      + '-8<--v-yaml--\r\n\r\n'
      + 'the: end';
    var snippable = new Snippable();

    var parts = snippable.parse(document);
    expect(parts).to.deep.equal([
      {foo: 42, bar: 'baz baz baz'},
      'Some *markdown*.',
      {foo: 'fou'},
      {the: 'end'}
    ]);
  });
});