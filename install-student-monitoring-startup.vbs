Option Explicit

Dim shell, fileSystem, root, startup, shortcut
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
root = fileSystem.GetParentFolderName(WScript.ScriptFullName)
startup = shell.SpecialFolders("Startup")
Set shortcut = shell.CreateShortcut(fileSystem.BuildPath(startup, "Student Monitoring.lnk"))
shortcut.TargetPath = "wscript.exe"
shortcut.Arguments = """" & fileSystem.BuildPath(root, "run-student-monitoring.vbs") & """ --no-browser"
shortcut.WorkingDirectory = root
shortcut.WindowStyle = 1
shortcut.Description = "Start Student Monitoring automatically"
shortcut.Save
MsgBox "Student Monitoring will start automatically when you sign in to Windows.", 64, "Student Monitoring"
