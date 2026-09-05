Option Explicit

Dim shell, fileSystem, root, openBrowser
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
root = fileSystem.GetParentFolderName(WScript.ScriptFullName)
openBrowser = True
If WScript.Arguments.Count > 0 Then
	If LCase(WScript.Arguments(0)) = "--no-browser" Then openBrowser = False
End If
Dim phpPath, command, http, ready, attempt
phpPath = FindPhp(shell, fileSystem)
If phpPath = "" Then
	MsgBox "PHP was not found. Install PHP or XAMPP first.", 16, "Student Monitoring"
	WScript.Quit 1
End If

If Not IsListening(shell) Then
	command = """" & phpPath & """ -S 0.0.0.0:8000 -t """ & root & """"
	shell.Run command, 0, False
End If

ready = False
For attempt = 1 To 20
	If CheckHttp(http) Then
		ready = True
		Exit For
	End If
	WScript.Sleep 500
Next

If ready And openBrowser Then
	shell.Run "http://127.0.0.1:8000/", 1, False
ElseIf Not ready Then
	MsgBox "The server did not become ready on port 8000.", 16, "Student Monitoring"
End If

Function FindPhp(shell, fileSystem)
	Dim result, candidate
	If fileSystem.FileExists("C:\xampp\php\php.exe") Then
		FindPhp = "C:\xampp\php\php.exe"
		Exit Function
	End If
	On Error Resume Next
	Set result = shell.Exec("where.exe php")
	candidate = Trim(result.StdOut.ReadLine())
	On Error GoTo 0
	FindPhp = candidate
End Function

Function IsListening(shell)
	Dim result, output
	On Error Resume Next
	Set result = shell.Exec("cmd /c netstat -ano -p tcp")
	output = result.StdOut.ReadAll()
	On Error GoTo 0
	IsListening = InStr(output, ":8000") > 0 And InStr(output, "LISTENING") > 0
End Function

Function CheckHttp(http)
	On Error Resume Next
	Set http = CreateObject("MSXML2.XMLHTTP")
	http.Open "GET", "http://127.0.0.1:8000/", False
	http.Send
	CheckHttp = (Err.Number = 0 And http.Status = 200)
	Err.Clear
	On Error GoTo 0
End Function

Set fileSystem = Nothing
Set shell = Nothing
