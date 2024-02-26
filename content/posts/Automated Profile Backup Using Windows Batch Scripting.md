---
author: "Ben Spears"
date: 2019-06-04
title: Automated Profile Backup Using Windows Batch Scripting
---

![img](https://images.unsplash.com/photo-1570378164207-c63f4e4f0563?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1955&q=80)


## Introduction

In this article I am going to go over the process of creating a script on backing up a user profile in Windows. We will be backing up the users Desktop, Documents, Downloads, Favorites (located in IE, Chrome, and Firefox), Music, Pictures, Videos, and even a list of the software installed on the machine running the script to refer back to when setting up the new machine. 
Utilities being used: echo off, color, cls, wmic, dir, robocopy, xcopy, and local variables (%backupdrive%, %profile%, etc.).

1. We are going to set a variable for the Backup Drive that we are going to be using. However, if you would like a list of removable drives there is a command for that:
```WMIC (Windows Management Instrumentation Command.)
wmic logicaldisk where drivetype=2 get deviceid, description, volumename
```
2. The input collected from the command below will be our %BackupDrive% variable.
```
SET /p BackupDrive=What is the drive letter to copy the profile to? Example d,e,f:
SET "variable=" SET /P variable=[promptString]
```
 3. I am using dir c:\users /ad /b to only show folders that are located in c:\users. We will be using one from the list for %profile%.

```
set /p Profile=What username are you backing up? 
```
The response to this command will set a variable for %Profile%

4. Now we will be using those variables to input the information in our source and destination locations for Robocopy(Robust File Copy). 
Source example: C:\Users\%Profile%\Desktop 
Destination example: %BackupDrive%:\Backup\%Profile%\Desktop 
The source and destination are only separated with a space in this example.
Complete command for backing up the Desktop folder to the backup drive:
```
Robocopy C:\Users\%Profile%\Desktop %BackupDrive%:\Backup\%Profile%\Desktop *.* /e
```
```*.*``` tells Robocopy to copy any file/extension and the /e includes empty folders as well
I recommend using this technique for any folders that you are wanting to backup.
                         
4. Getting a list of software to install on the new machine is crucial for a manual computer migration. Using the script below assists with the documentation process greatly. Credit for that goes to Stack Overflow. 
###### (https://stackoverflow.com/questions/1482739/batch-file-to-get-specific-installed-software-along-with-version)


```
reg export HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall temp1.txt
    find "DisplayName" temp1.txt| find /V "ParentDisplayName" > temp2.txt
    for /f "tokens=2,3 delims==" %%a in (temp2.txt) do (echo %%a >> software_list.txt)
    del temp1.txt
    del temp2.txt
    xcopy "software_list.txt" %BackupDrive%:\Backup\%Profile%\Desktop
    cls
    echo The software installed on this computer has been documented and can be found at %BackupDrive%:\Backup\%Profile%\Desktop\software_list.txt
```


5. After everything has been copied over our backup folder destination will be located at %BackupDrive%:\Backup\%Profile%\

I have uploaded the complete script uploaded to Google Drive named Profile Backup Utility.bat
```
https://drive.google.com/file/d/1yhdT7ospk3ZPO3Ks3jVvpTa87Zo3spFr/view?usp=sharing
```
Note: This needs to be run with Administrative credentials, and with all web browsers closed. 