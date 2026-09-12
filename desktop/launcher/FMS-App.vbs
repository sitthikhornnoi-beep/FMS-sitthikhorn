Set WshShell = CreateObject("WScript.Shell")
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run Chr(34) & strCurrentDir & "\FMS-Launcher.bat" & Chr(34), 0, False
Set WshShell = Nothing
