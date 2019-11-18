# Peastee

A time travel GUI for searching web archives on top of [Archive-search](https://github.com/lobbeque/archive-search). Named in reference to Lovecraft's "The Shadow Out of Time". 

## Current dependencies 

### index.html dependencies

   1. JQuery 1.12.1
   2. Boostrap 3.3.6
   3. Boostrap-datepicker
   4. D3.js 4.0.0
   5. Underscore 1.8.3
   6. Angular 1.5.0
   7. Async
   8. Bootsrap-toggle 2.2.2
   9. Font-awesome 4.5.0

### server.js dependencies

   1. Node.js 
   2. [Archive-search](https://github.com/lobbeque/archive-search)

## Usage 

Download or clone the source file:

```
git clone https://github.com/lobbeque/peastee.git
```

Run the node.js server:

```
node server.js
```

Run the Web archives search engine (see [Archive-search](https://github.com/lobbeque/archive-search)).

**Important:** Edit the configuration's file to let the `server.js` know where to find the search engine. For instance `http://localhost:8800/solr/...`   

Load the GUI in your Web browser using the following url `file:///local-path/peastee/index.html`. 

Start looking for a given keyword in the search box. The query syntax of Peastee is a transposition of the query syntax of [Lucene](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html).

## Licence

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.