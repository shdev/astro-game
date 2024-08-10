# Makefile to copy files to an SSH server
scp index.html game.js *.png *.jpg *.mp3 shdev_ftp:${ASTRO_PATH}
# Define variables
SSH_HOST = ${ASTRO_HOST}
SSH_PORT = 22  # Default SSH port

# Define the files to copy
FILES = index.html game.js *.png *.jpg *.mp3 *.webmanifest *.svg *.ico
TARGET_DIR = ${ASTRO_PATH}

# Define the SCP command
SCP = scp -prP $(SSH_PORT)

# Target to copy files
copy:
	@echo "Copying files to $(SSH_USER)@$(SSH_HOST):$(TARGET_DIR)"
	$(SCP) $(FILES) $(SSH_HOST):$(TARGET_DIR)
