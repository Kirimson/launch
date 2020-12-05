# Launch

A customisable startpage, made to look like and feel like a terminal

## Basics

Launch is comprised files and folders. Folders can be added with the `mkdir`
command, and files can be added to both the root of Launch, or to a folder
with the `touch` command.

As of right now, you can't make nested folders, sorry!

## Files

There are two filetypes that can be added, link files (.lnk) and query files
(.qry)

Files can be ran either by clicking on the in the tree, or by entering the
filename (for Links) or the prefix (for Queries) into the commandline.

As files are used, they will be ranked higher is fuzzy searches, making it
easier to access/use frequently used files.

### Link Files

A simple link to a given site. Can be either clicked on in the `tree` or ran
from the commandline by typing the filename/path.

### Query Files

Similar to a normal Link File, but allows user input which will be added to the
URL in a user-defined spot. Allows you to make files to search sites, fill in
just a small part of a URL with custom input, etc...

Query Files can be used by typing the prefix for that file, followed by any text
to search with.

Query files can also be clicked on in the tree to insert the prefix into the
commandline for you.

Query files can also be used by typing the path to the file, all additional text
after a space will be used as the search term. 

## Default Files

A 'launch' folder is originally created with some query files pre-made.
The shorthand and services are:
- g: google search, using format https://www.google.com/search?q=${}
- b: bing search, using format https://www.bing.com/search?q=${}
- ddg: duckduckgo search, using format https://duckduckgo.com/?q=${}
- ama: amazon search, using format https://www.amazon.co.uk/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords=${}
- map: google maps search, using format https://www.google.co.uk/maps/search/${}

Any of these files can easily be delete with `rm` or the entire folder deleted
with `rmdir launch`.

By default, anything entered into the commandline that does not match a command
or a link, will use the g: query file to search Google.

## Personalisation

Launch can also be personalised in a number of ways outside of just making files
and folder. Additionally, you can:

- Set the background
- Set the window color
- Show/hide the file tree
- Change the default query file
- Toggle the use of fuzzy search

## Commands

Below is the full list of commands that can be performed on Launch and how to
use them, with examples.

### mkdir

Creates a new folder/s

Usage: `mkdir [folderName, ...]`

Examples:

- `mkdir media`
- `mkdir media social`

### rmdir

Removes an existing folder

Usage: `rmdir [folderName]`

Example:
- `rmdir videos`

### touch

Creates a new file

Usage: `touch [filePath/fileName] [fileContent]`

Examples:

- `touch folderName/fileName.lnk www.website.com`
- `touch folderName/fileName www.website.com`
- `touch folderName/fileName.qry s: www.website.com/search?q=${}`

Notes:

- if no file extension is provided, Launch will assume the filetype is .lnk
- in the Query example `s:` will be used as the prefix for the query files
- in the link for Query files, ${} will be replaced with whatever is provided
after the Query file's prefix when a Query file is ran. E.g s:hello will take
you to `www.website.com/search?q=hello`

### rm

Removes a file

Usage: `rm [-rf] [fileName]`

Example:
- `rm file.lnk`
- `rm videos/youtube.lnk`
- `rm -rf`

Notes:

- The `rm -rf` command will delete ALL files and folders, please take caution
before running it

### mv

Moves (or renames) files and folders

Usage: `mv [path1] [path2]`

Examples:

- `mv videos/yuotbue.lnk videos/youtube.lnk`
- `mv miscellaneous/ misc/`
- `mv misc/googledrive.lnk storage/`
- `mv misc/random.lnk /`

Notes:

- The third example `mv misc/googledrive.lnk storage/` will move the file
`googledrive.lnk` into the `storage` folder, keeping the filename

### tree

Toggles the tree

Usage: `tree`

### set-background

Sets the background of Launch

Examples:

- `set-background www.website.com/img/coolimg.jpg`
- `set-background --clear`

Notes:

- `set-background --clear` will reset wallpaper to the default image
- `set-background` has multiple aliases. `set-bg`, and `feh` will also act as
`set-background`

### set-color

Sets the window color

Usage: `set-color [color]`

Examples:

- `set-color #234eb9`
- `set-color rgb(0,100,100)`
- `set-color red`

Notes:

- When setting the window color the text color will change depending on brightness of background color
- `set-color` has multiple ailiases. `set-colo` and `colo` will also act as
`set-color`

### set-search

Sets the default query link to use, based off of the prefix. Can also be set to
none to disable this

Usage: `set-search [prefix]`

Examples:
- `set-search g:`
- `set-search b:`
- `set-search none`

### fuzzy

Enables/Disables fuzzy searching for files, with a dropdown list to show matched
files

Usage: `fuzzy`

Notes:

- Use the up and down arrow keys to navigate the list, press enter to execute
the selected file
- Executing a Query file using the fizzy search will insert the prefix for that
query into the commandline, much like clicking it in the tree

### clear-hits

Clears the amount of 'hits' a file has had, resetting it to being executed 0 times

Usage: `clear-hits folder/file.lnk`

### set-hits

Sets the amount of 'hits' a file has had, to a user defined amount

Usage: `set-hits folder/file.lnk 100`

### launch-hide-privacy

Hides the privacy text in the corner of the screen

Usage: `launch-hide-privacy`

### launch-show-privacy

Shows the privacy text in the corner of the screen

Usage: `launch-show-privacy`

### launch-help

Opens this page

Usage: `launch-help`