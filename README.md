snippable.js
============

Snippable is a human-writable multipart document format.
The main goal of Snippable is to be able to add structured metadata
to an unstructured document while keeping it in a single file that
a non-technical person can edit.

Part formats
------------

The different parts of a Snippable document are each in a specific format.
Snippable does not prescribe what format to use for the document parts,
only how to include and separate them.
Human-writable and readable formats such as Markdown and YAML are preferred,
but not mandatory.

Separator
---------

In a Snippable document, the different parts are separated by the following
separator, on its own line of text.

    -8<--------------

There may be arbitrary white space around this separator.
The number of dashes can be anything above 2, so the following are equivalent:

    -8<--
    -8<--------------------------------------

Escaping the separator characters
---------------------------------

As the separator needs to be on its own line, so you should rarely if ever
need to escape it.
It should usually be enough to add one or more spaces in front of the sequence
so that it ceases to be interpreted as a separator.

Specifying part formats
-----------------------

Formats are usually specified through the file extensions.
For example, a `document.yaml.md` file has a YAML header followed by a Markdown
section.

It is also possible to specify the formats from the document itself, embedded
in the separator.
Formats specified this way take precedence over formats specified through other means.
The separator can contain format specifications for the part before them, the
part after them, or both:

    -8<--^-yaml--------
    -8<--v-md----------
    -8<--^-yaml--v-md--

Typical Snippable file
----------------------

A typical file consists in a YAML header, and a Markdown document.
For that reason, if no formats are specified or known, YAML and Markdown
are assumed for the first two parts of a document.

    -document.yaml.md-

    Title: A simple snippable document
    Author: Bertrand Le Roy
    Tags: snippable, yaml, markdown, multipart

    -8<-----------------------------------------------------

    A Snippable Document
    ====================

    This is what a snippable document looks like.
    This document has two parts:

    * a YAML header
    * this Markdown document

    It should not look too terrible to a regular Markdown parser
    and can be parsed to extract the header.

Using the library
-----------------

First, add the library to your project:

    npm install snippable --save

You can then require the library and parse files using it:

    var Snippable = require('snippable');
    var fs = require('fs');

    var snippable = new Snippable();
    var path = 'docs/document.yaml.md';
    fs.readFile(path, function(err, data) {
      var parts = snippable.parse(data, path);
      var header = parts[0];
      var body = parts[1];
      // Do something with the header and body.
    });

Adding a parser
---------------

If a format is not recognized, the part will be returned as an
unparsed string.
The library comes with parsers for JSON and YAML (Markdown is
often assumed but its parsing must be done by your own code: it
will be handed out as a string).

You may add your own parsers:

    snippable.registerParser('csv', function(text) {
      var lines = splitLines(text);
      var parsed = lines.map(function(line) {
        return splitOnCommas(line);
      })
      return parsed;
    });

License
-------

Both the JavaScript library and the format specification are released
under MIT license, which allows you to do pretty much as you like with
it, including commercial and open-source applications.