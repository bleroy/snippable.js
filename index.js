// Snippable.js (c) 2015 Bertrand Le Roy, under MIT. See LICENSE.txt for licensing details.
'use strict';
var path = require('path');
var YAML = require('yamljs');

/**
 * Parses human-writable files in the Snippable format.
 */
var Snippable = module.exports = function Snippable() {
  this.parsers = {
    json: JSON.parse,
    yaml: YAML.parse
  };
};

/**
 * Registers a parser for a type of document part.
 * @param {string} format The name of the document part format this parser can parse.
 * @param {parser} parser The parsing function.
 */
Snippable.prototype.registerParser = function registerParser(format, parser) {
  this.parsers[format] = parser;
};

/**
 * Gets a list of formats from a file name or path.
 * @param {string} fileName The file name or path.
 * @returns {string[]} The list of formats.
 */
Snippable.prototype.getFormatsFromFileName = function getFormatsFromFileName(fileName) {
  return path.basename(fileName).split('.').slice(1);
};

/**
 * Parse a Snippable document.
 * @param {string} path The path to the file to read and parse.
 * @param {string[]|string} [formatsOrFileName] list of formats for the parts,
 *   or filename with file extensions describing formats. Formats encoded within the file
 *   take priority over those values.
 * @returns {object[]} The list of parsed document parts.
 */
Snippable.prototype.parse = function parse(text, formatsOrFileName) {
  var self = this;
  var splitExpression = /^-8<-+(-\^-([^-]+)-+)?(-v-([^-]+)-+)?-+$/gm;
  var formats = Array.isArray(formatsOrFileName)
    ? formatsOrFileName
    : formatsOrFileName
    ? this.getFormatsFromFileName(formatsOrFileName)
    : ['yaml'];
  var partSources = [];
  var i = 0;
  var current = 0;
  var match;
  while ((match = splitExpression.exec(text)) != null) {
    if (match[2]) {
      formats[i] = match[2];
    }
    if (match[4]) {
      formats[i + 1] = match[4];
    }
    partSources.push(
      text.substring(current, match.index).trim());
    current = splitExpression.lastIndex;
    i++;
  }
  partSources.push(text.substr(current).trim());
  // All part sources are available. Now parse them.
  return partSources.map(function parsePart(partSource, index) {
    var format = formats[index];
    var parser = self.parsers[format];
    if (!parser) return partSource;
    return parser(partSource);
  });
};

/**
 @callback parser A part parser.
 @param {string} text The text to parse.
 @param {partParsed} done The function that is called with the parsed object once parsing is done.
 */