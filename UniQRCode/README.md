# unicode-qr
## this was vibecoded to replicate the functionality of https://lillibridge.io/ascii-qr/ as a cli

Generate terminal-friendly Unicode QR codes from text or a UTF-8 file. The QR
encoding and rendering match the supplied web implementation:

- `1x` (default) uses half-block characters and two QR rows per terminal line.
- `2x` uses full blocks and two terminal columns per QR module.

## Usage

Install dependencies and run the CLI:

```sh
npm install
node bin/unicode-qr.js "https://example.com"
```

The generated QR code is printed to stdout and copied to the clipboard. Use
`--no-copy` when piping or when clipboard access is unavailable:

```sh
node bin/unicode-qr.js --mode 2x --no-copy "hello"
node bin/unicode-qr.js --file ./payload.txt
printf 'hello' | node bin/unicode-qr.js --no-copy
```

Run `node bin/unicode-qr.js --help` for all options. Input must fit the QR
library's selected QR version; oversized input is reported as an error.

## Install the `uqr` command

To install the project and its dependencies globally, run this command from the
project directory. npm creates the `uqr` command in its
global bin directory:

```sh
sudo npm install --global .
```

Verify the installation:

```sh
uqr --help
uqr "https://example.com"
```

After changing the source, reinstall it:

```sh
sudo npm install --global .
```

To uninstall the command:

```sh
sudo npm uninstall --global unicode-qr
```

## Arch Linux

Install the Arch build tools and the runtime clipboard backend:

```sh
sudo pacman -S --needed base-devel nodejs npm xsel
```

Build and install the package from this project directory:

```sh
makepkg -si
```

The package installs only the `uqr` command. To update it after changing the
source, rebuild and reinstall it:

```sh
makepkg -si --cleanbuild
```

## Tests

```sh
npm test
```
