# Launch

A terminal-esc startpage with (hopefully) easy to use commands with quick customisation options to make your page unique

## Structure

Launch is made up primarially of folders and files.
To keep things simple an quick, only one layer of folders are allowed (no nested folders, sorry!)

Files do not need to belong to a folder though, they can exist in the root directory as well, if that's what you want.

There are two types of files. Links (.lnk) and Queries (.qry)

### Links

These redirect you to a set page from running them. the same thing everytime. Nice and consistant

### Queries

Useful for linking to other pages that would require user input. Type the queries shorthand, give it a search term and it will go to the site and fill in the right section of the url with your search term (assuming you set the file up right, of course)

## Using Files

To execute a file, type the beginning of its name with the console focused, press enter and launch will find the closest matching file.
If you dont want to live life on the edge and want the exact file you want to run, tab autocomplete exists to get to the folder/file you want quickly

### Links 

#### Examples

- `$ youtube`
- `$ videos/youtube`
- `$ videos/youtube.lnk`

Will all get you to the same link (maybe even `you` would if nothing else matches)

#### Creation

`touch folderName/fileName.lnk www.website.com`

See `Commands` below for more info


### Querys

#### Examples
- `g: really clever question`
- `b: cool dog facts`

Will search whatever `g:` or `b:` is set to. See `Out The Box` below for the defaults

#### Creation

`touch folderName/fileName.qry www.website.com/search?q=${}`
See `Commands` below for more info

## Out the box

A 'launch' folder is originally created with some query files pre-made.
The shorthand and services are:
- g: https://www.google.com
- b: https://www.bing.com
- ddg: https://duckduckgo.com
- ama: https://www.amazon.co.uk
- map: https://www.google.co.uk/maps

## Personalisation

Window colour, background color, and a seperate window for a tree representation can be customised. The default search can be chnaged as well to any other shorthand you have setup in your query files

## Commands

### mkdir

Creates a new folder

Usage: `mkdir [folderName ...]`

Examples:
- `mkdir videos` 
- `mkdir reddit social`

---

### rmdir

Removes a folder

Usage: `rmdir [folderName]`

Example:
- `rmdir videos`

---

### touch

Creates a file with content

Usage: `touch [filePath/fileName] [fileContent]`

Examples:
- `touch folderName/fileName.lnk www.website.com`
- `touch folderName/fileName www.website.com`
- `touch folderName/fileName.qry www.website.com/search?q=${}`

Notes:
- ${} in a .qry files link will be replaced by whatever is after the shorthand when ran
- if no file extension is provided, file will be a .lnk
- if no content is provided, content will default to '#'

---

### rm

Removes a file

Usage: `rm [-rf] [fileName]`

Example:
- `rm videos/youtube.lnk`
- `rm -rf`

Notes:
- Please take caution when running `rm -rf` it will unforgivingly delete everything without asking

---

### mv

Moves files and folders

Usage: `mv [path1] [path2]`

Examples:
- `mv videos/yuotbue.lnk videos/youtube.lnk`
- `mv miscellaneous/ misc/`
- `mv misc/googledrive.lnk storage/`
- `mv misc/random.lnk /`

---

### tree

Toggles the tree from view

Usage: `tree`

Notes:
- .lnk files can be clicked to go to the link
- .qry files can be clicked to fill the shorthand into the console

---

### feh

Sets wallpaper

Usage: `feh [--clear] [imageUrl]`

Examples:
- `feh www.website.com/img/coolimg.jpg`
- `feh --clear`

Notes:
- `feh --clear` will reset wallpaper to the default image

---

### colo

Sets window color

Usage: `colo [color]`

Examples:
- `colo #234eb9`
- `colo rgb(0,100,100)`
- `colo red`

Notes:
- When setting the window color the text color will change depending on brightness of background color

---

### setsearch

Sets the default query link to use, based off of shorthand

Usage: `setsearch [shortHand]`

Examples:
- `setsearch g:`
- `setsearch b:`

---

### fzf

Enables an fzf lookalike when typing. Files that can be executed are listed.
Up/Down arrows navigats between them

Usage: `fzf`