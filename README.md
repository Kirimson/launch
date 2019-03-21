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

  - I want this fast to use. Why should we need to `cd` into 5 sub folders 
  to be able to go to a site to make it """granular"""

Fuzzy searching will be used to get *Max Performance*
- can use either folder name or file name to search for stuff
- files will use a 'long name' to help searching eg:
  - `work/jira`
    - can type `jira` or `work` or any part of the two to find `work/jira`

- Search queries will use a set syntax, using url params to make things 
universal (so long the site does not rely solely on POST)
  - example for google
    - `g: https://www.google.com/search?q=${}`
      - with input example of `g: what is the meaning of life`, `${}` will 
      be replaced with *what+is+the+meaning+of+life* using web encoding
      - final url: `https://www.google.com/search?q=what+is+the+meaning+of+life`
  - search queries need to end in the extension `.qry`
    - example: `google.qry`

In the terminal, typing without a prefix will default to finding links. 
To use a query, the prefix needs to be used

## Making Folders

Command: `mkdir`

Usage: `mkdir directoryName`

- makes a new folder
- only one folder hierarchy. no folders in folder
  - essentially, folders can only be made in root
- multiple folders can be made at once
  - `mkdir foo bar`
    - makes folders `foo` and `bar`

## Making Files

Command: `touch`

Usage: `touch filePath`

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

Usage: `rm fileName`

- can remove a file
  - `rm folder/file.lnk`
  - `rm folder/query.qry`
- cannot remove a directory

## Removing Folders

Command: `rmdir`

Usage `rmdir directoryName`

- can remove a folder
  - `rmdir folder`
- will not remove files (unless inside the folder)

# Customisation

Nothing's worse than a boring startpage that cant be personalised.
It mimicking a linux console is even more reason for you to be able to *rice* it!

## Set background

Like how all lazy i3 *power users* do it. **feh**. 

Command: `feh`

Usage: `feh [backgroundUrl]`

        --clear
                Clears the background and returns to default


- sets background property in launch

## Set Window Color

Set the window color, vim style. Yes, it's very all over the place, but I have 
no clue what default linux command would do this

Command: `colo`

Usage: `colo [color]`

## Toggle tree

toggle the tree section, hidden by default

Command: `tree`

## Default Search

Change the default search provider using existing .qry files

Command: `setsearch`

Usage: `setsearch [shorthand]`