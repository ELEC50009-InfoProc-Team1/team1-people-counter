SERVER_FLDR:=server
CLIENT_FLDR:=client

CYAN:=\e[0;36m
RESET:=\e[0m

all: client server
	@echo "[$(CYAN)make$(RESET)] Cleaning server public folder..."
	@rm -rf $(SERVER_FLDR)/public 2> /dev/null
	@mkdir $(SERVER_FLDR)/public
	@rm -f $(SERVER_FLDR)/index.html 2> /dev/null
	@echo "[$(CYAN)make$(RESET)] Copying client built files..."
	@cp -r $(CLIENT_FLDR)/build/client/* $(SERVER_FLDR)/public/
	@mv $(SERVER_FLDR)/public/index.html $(SERVER_FLDR)/index.html
	@echo "[$(CYAN)make$(RESET)] Ready to start!"

client:
	@echo "[$(CYAN)make$(RESET)] Installing client dependencies..."
	@cd $(CLIENT_FLDR); npm ci
	@echo "[$(CYAN)make$(RESET)] Building client..."
	@cd $(CLIENT_FLDR); npm run build
	@echo "[$(CYAN)make$(RESET)] Built client."

server:
	@echo "[$(CYAN)make$(RESET)] Installing server dependencies..."
	@cd $(SERVER_FLDR); npm ci
	@echo "[$(CYAN)make$(RESET)] Building server..."
	@cd $(SERVER_FLDR); npm run build
	@echo "[$(CYAN)make$(RESET)] Built server."

.PHONY: start all client server

start:
	@cd $(SERVER_FLDR); npm run start
