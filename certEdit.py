import os
import sys
import fileinput

#Read key created by certbot
keyFile = open("keyFile.txt")
for line in range(5):
    #Must read lines 1-4. Store line 5 without \n at the end.
    keyLine = keyFile.readline().strip()
keyFile.close()

#Create URL substring at "."
keyURL = (keyLine.split(".", 1))[0]
print(keyURL)

#Write URL substring to certificate server
with fileinput.FileInput("./src/cert.js", inplace=True, backup='.bak') as file:
    for line in file:
        print(line.replace("certificateString", keyURL), end='')

#Write full key to pasteCertificate.txt
pasteCertificate = open("pasteCertificate.txt", "w")
pasteCertificate.write(keyLine)
pasteCertificate.close()