# People Counter server

This respository contains the server code for Team 1's people counter.

## Usage

This project is designed to be developed/ran in a Linux environment. The commands provided below should work in a Debian Linux environment.

1. Install NodeJS (recommended to use `nvm` to do so):

    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    \. "$HOME/.nvm/nvm.sh"
    nvm install 24
    ```

    As of writing,this should install the latest LTS version of NodeJS, and running

    ```bash
    node -v
    npm -v
    ```

    should print

    ```bash
    v24.12.0
    11.8.0
    ```

    respectively.

2. Clone the repository:

    ```bash
    git clone https://github.com/ELEC50009-InfoProc-Team1/pc-server.git pc-server
    cd pc-server
    ```

3. Run the default Makefile target:

    ```bash
    make
    ```

4. Check any configuration (includes going to `server/.env.example`, renaming it to `.env` and filling in the required fields) and start the server:

    ```bash
    make start
    ```

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md).
