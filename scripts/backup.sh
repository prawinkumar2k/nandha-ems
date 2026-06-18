#!/bin/bash
# MongoDB Automated Backup Script
# This script creates a compressed dump of the MongoDB database and rotates old backups.

# Setup variables
BACKUP_DIR="/var/backups/neclms"
MONGO_URI=${MONGODB_URI:-"mongodb://localhost:27017/neclms"}
DATE=$(date +%Y-%m-%d_%H-%M-%S)
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup for NEClms at $DATE..."

# Run mongodump and archive it via gzip
mongodump --uri="$MONGO_URI" --gzip --archive="$BACKUP_DIR/backup_$DATE.archive"

if [ $? -eq 0 ]; then
  echo "✅ Backup successfully created: $BACKUP_DIR/backup_$DATE.archive"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Clean up backups older than $RETENTION_DAYS
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.archive" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "✅ Backup process completed successfully."
