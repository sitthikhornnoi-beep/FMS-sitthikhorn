; Inno Setup Script for Faculty Management System (FMS)
; Download Inno Setup from: https://jrsoftware.org/isinfo.php

#define MyAppName "ระบบบริหารจัดการคณะ (FMS)"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Faculty Management System"
#define MyAppExeName "FMS-App.vbs"
#define MyAppStopName "stop.bat"

[Setup]
AppId={{D3A5F6E7-8B9C-4D2E-BF1A-7E5D3C9A1B2F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\FMS-Faculty-System
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\..\dist\installer
OutputBaseFilename=FMS-Faculty-System-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
DisableProgramGroupPage=auto

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\..\dist\FMS-Windows-App\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{group}\ปิดระบบ FMS"; Filename: "{app}\{#MyAppStopName}"; WorkingDir: "{app}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: shellexec postinstall skipifsilent

[UninstallRun]
Filename: "{app}\{#MyAppStopName}"; Flags: runhidden
