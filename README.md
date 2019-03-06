# Launch

## Basics
There will be some basic stuff baked in
- premade folder `launch`
- inside `launch` will be some search queries
  - google g:
  - amazon ama: 
  - maps maps: 
  - etc...

There will be no directory switching
  - I want this fast to use. Why should we need to `cd` into 5 sub folders to be able to go to a site to make it """granular"""

Fuzzy searching will be used to get *Max Performance*
- can use either folder name or file name to search for stuff
- files will use a 'long name' to help searching eg:
  - `worksites/jira`
    - can type `jira` or `worksites` or any part of the two to find `worksites/jira`

- Search queries will use a set syntax, using url params to make things universal (so long the site does not rely solely on POST)
  - example for google
    - `g: https://www.google.com/search?q=${}`
      - with input example of `g: what is the meaning of life`, `${}` will be replaced with *what+is+the+meaning+of+life* using web encoding
      - final url: `https://www.google.com/search?q=what+is+the+meaning+of+life`
  - search queries need to end in the extension `.qry`
    - example: `google.qry`

In the terminal, typing without a prefix will default to finding links. To use a query, the prefix needs to be used

## Making Folders
Command: `mkdir`
- makes a new folder
- only one folder hierarchy. no folders in folder
  - essentially, folders can only be made in root
- multiple folders can be made at once
  - `mkdir foo bar`
    - makes folders `foo` and `bar`

## Making Files
Command: `touch`
  - makes a new file in a given folder
  - files can be two things
    - link
        - `touch folder/website.lnk`
    - contents are the link to go to
    - search query
        - `touch folder/query.qry`
    - contents are the prefix, then the link with `${}` as placeholder for query string



## Removing Files
Command: `rm`
- can remove a file
  - `rm folder/file.lnk`
  - `rm folder/query.qry`
- cannot remove a directory

## Removing Folders
Command: `rmdir`
- can remove a folder
  - `rmdir folder`
- will not remove files (unless inside the folder)