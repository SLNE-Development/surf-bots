@echo off
java -jar -Dminecraft.api.session.host=http://localhost:8000 -Dminecraft.api.services.host=https://api.minecraftservices.com paper.jar nogui
pause