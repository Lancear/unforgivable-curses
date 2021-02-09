Set fs = CreateObject("Scripting.FileSystemObject")
Const CLASSNAME = 0
Const SUPERCLASS = 1
Const CLASS_HEAD = 2
Const FIELDS = 3
Const GETTER_SETTER = 4
Const METHODS = 5


Dim mpojonFile, outDir, currOutFile, classes(32, 5), nextClassIdx, classIdx


Call main



Sub main
    setPaths()
    
    If Not fs.folderExists(outDir) Then
        fs.CreateFolder(outDir)
    End If
    
    Dim fileContent : fileContent = readAll(mpojonFile)
    MsgBox(fileContent)
    Dim lines : lines = Split(fileContent, vbCrLf)
    
    nextClassIdx = 0
    classIdx = -1
    
    processAllLines(lines)
    saveClass()
    
    MsgBox("Done!")
End Sub



Sub handleError(message)
    MsgBox(message)
    Wscript.Quit()
End Sub



Sub setPaths()
    If WScript.Arguments.Count = 2 Then
        mpojonFile  = WScript.Arguments(0)
        outDir      = WScript.Arguments(1) & "/"
    ElseIf WScript.Arguments.Count = 1 Then
        mpojonFile  = WScript.Arguments(0)
        outDir      = InputBox("Full path of the output directory:") & "/"
    Else
        mpojonFile  = InputBox("Full path of the MPOJON file:")
        outDir      = InputBox("Full path of the output directory:") & "/"
    End If

    currOutFile = outDir
End Sub

Function readAll(path)
    Set fr = fs.OpenTextFile(mpojonFile, 1)
    readAll = fr.ReadAll
    fr.Close
End Function

Sub processAllLines(lines)
    If Not UBound(lines) >= 0 Then
        handleError("The MPOJON file is empty!")
    End If

    For Each line In lines
        If len(line) > 0 Then
            Dim trimmedLine : trimmedLine = removeAdditionalSpaces(line)
            
            Dim tokens : tokens = Split(trimmedLine, " ")
            processTokens(tokens)
        End If
    Next
End Sub

Sub saveClass()
    If classIdx >= 0 Then
        Dim fw : Set fw = fs.OpenTextFile(currOutFile, 8, True)
        fw.WriteLine(classes(classIdx, CLASS_HEAD) & vbCrLf & classes(classIdx, FIELDS) & vbCrLf & vbCrLf & generateConstructor() & vbCrLf & vbCrLf & classes(classIdx, METHODS) & vbCrLf & classes(classIdx, GETTER_SETTER) & "}")
        fw.Close()
        classIdx = -1
    End If
End Sub



Function removeAdditionalSpaces(line)
	removeAdditionalSpaces = line
	
    Do While InStr(removeAdditionalSpaces, "  ") > 0
        removeAdditionalSpaces = Replace(removeAdditionalSpaces, "  ", " ")
    Loop
End Function

Sub processTokens(tokens)
    If Ubound(tokens) = 0 Then
        handleError("Invalid token: " & tokens(0))
    End If
    
    callTokensHandler(tokens)
End Sub

Function generateConstructor()
    Dim fields : fields = getAllFields(classIdx)
    Dim superFields : superFields = ""
    Dim tempClassIdx : tempClassIdx = classIdx
    
    Do While len(classes(tempClassIdx, SUPERCLASS)) > 0
        tempClassIdx = getClassIdx(classes(tempClassIdx, SUPERCLASS))
        superFields = superFields & getAllFields(tempClassIdx)
    Loop
    
    Dim body : body = ""
    Dim head : head = vbTab & "public " & classes(classIdx, CLASSNAME) & "(" & Join(Split(fields, ";"), ", ")
    
    If len(superFields) > 0 Then
        head = head & ", " & Join(Split(superFields, ";"), ", ")
        
        superFields = Join(Split(superFields, ";"), " ")
        superFields = Split(superFields, " ")
        
        body = vbTab & vbTab & "super(" & superFields(1)
        
        For idx = 3 To UBound(superFields) Step 2
            body = body & ", " & superFields(idx)
        Next
        
        body = body & ");" & vbCrLf & vbCrLf
    End If
    
    head = head & ") {" & vbCrLf 
    
    fields = Join(Split(fields, ";"), " ")
    fields = Split(fields, " ")
    
    For idx = 1 To UBound(fields) Step 2
        body = body & vbTab & vbTab & "set" & UCase(Mid(fields(idx), 1, 1)) & Mid(fields(idx), 2, len(fields(idx)) - 1) & "(" & fields(idx) & ");" & vbCrLf
    Next
    
    generateConstructor = head & body & vbTab & "}" & vbCrLf
End Function

Sub callTokensHandler(tokens)
    Select Case tokens(0)
        Case "+"
            handleNewClass(tokens)
        Case "."
            handleNewClass(tokens)
        
        Case "++"
            handleProperty(tokens)
        Case "+."
            handleProperty(tokens)
        Case "+_"
            handleProperty(tokens)
        Case "+-"
            handleProperty(tokens)
        Case "+!"
            handleProperty(tokens)
        Case ".+"
            handleProperty(tokens)
        Case ".."
            handleProperty(tokens)
        Case "._"
            handleProperty(tokens)
        Case ".-"
            handleProperty(tokens)
        Case ".!"
            handleProperty(tokens)
        Case "_+"
            handleProperty(tokens)
        Case "_."
            handleProperty(tokens)
        Case "__"
            handleProperty(tokens)
        Case "_-"
            handleProperty(tokens)
        Case "_!"
            handleProperty(tokens)
        Case "-+"
            handleProperty(tokens)
        Case "-."
            handleProperty(tokens)
        Case "-_"
            handleProperty(tokens)
        Case "--"
            handleProperty(tokens)
        Case "-!"
            handleProperty(tokens)
        Case "!+"
            handleProperty(tokens)
        Case "!."
            handleProperty(tokens)
        Case "!_"
            handleProperty(tokens)
        Case "!-"
            handleProperty(tokens)
        Case "!!"
            handleProperty(tokens)
            
        Case "#="
            handleHashcodeAndEquals(tokens)
            
        Case "" & chr(34)
            handleToString(tokens)
            
        Case Else
            handleError("Invalid token: " & tokens(0) & " in " & Join(tokens, " "))
    End Select
End Sub



Sub handleNewClass(tokens)
    saveClass()
    
    If Not (tokens(0) = "+" Or tokens(0) = ".") Then
        handleError("Invalid token: " & tokens(0) & " in " & Join(tokens, " "))
    End If

    If UBound(tokens) = 2 Or UBound(tokens) = 4 Then
        initialiseClass()
        Dim packageName : packageName = tokens(1)
        classes(classIdx, CLASSNAME) = tokens(2)
        
        createPackageFolders(packageName)
        currOutFile = currOutFile & classes(classIdx, CLASSNAME) & ".java"
        
        classes(classIdx, CLASS_HEAD) = "package " & packageName & ";" & vbCrLf & vbCrLf
        
        If tokens(0) = "+" Then
            classes(classIdx, CLASS_HEAD) = classes(classIdx, CLASS_HEAD) & "public " & classes(classIdx, CLASSNAME)
        End If
        
        If UBound(tokens) = 4 Then
            If Not tokens(3) = "=" Then
                handleError("Invalid token: " & tokens(0) & " in " & Join(tokens, " "))
            End If
        
            classes(classIdx, SUPERCLASS) = tokens(4)
            classes(classIdx, CLASS_HEAD) = classes(classIdx, CLASS_HEAD) & " extends " & classes(classIdx, SUPERCLASS)
        End If
        
        classes(classIdx, CLASS_HEAD) = classes(classIdx, CLASS_HEAD) & " {"
    Else
		handleError("Invalid number of tokens at: " & tokens)
	End If
End Sub

Sub handleProperty(tokens)
    If classIdx < 0 Then
        handleError("A class must be specified first!")
    End If
    
    If Not UBound(tokens) = 2 Then
        handleError("Missing or too many arguments!")
    End If
    
    classes(classIdx, FIELDS) = classes(classIdx, FIELDS) & vbTab & "private " & tokens(1) & " " & tokens(2) & ";" & vbCrLf
    
    If Not Mid(tokens(0), 1, 1) = "!" Then
        classes(classIdx, GETTER_SETTER) = classes(classIdx, GETTER_SETTER) & vbTab
        addAccessLevel classes(classIdx, GETTER_SETTER), Mid(tokens(0), 1, 1)
        classes(classIdx, GETTER_SETTER) = classes(classIdx, GETTER_SETTER) & tokens(1) & " get" & UCase(Mid(tokens(2), 1, 1)) & Mid(tokens(2), 2, len(tokens(2)) - 1) & "() {" & vbCrLf & vbTab & vbTab & "return " & tokens(2) & ";" & vbCrLf & vbTab & "}" & vbCrLf
    End If
    
    If Not Mid(tokens(0), 2, 1) = "!" Then
        classes(classIdx, GETTER_SETTER) = classes(classIdx, GETTER_SETTER) & vbTab
        addAccessLevel classes(classIdx, GETTER_SETTER), Mid(tokens(0), 2, 1)
        classes(classIdx, GETTER_SETTER) = classes(classIdx, GETTER_SETTER) & "void set" & UCase(Mid(tokens(2), 1, 1)) & Mid(tokens(2), 2, len(tokens(2)) - 1) & "(" & tokens(1) & " new" & UCase(Mid(tokens(2), 1, 1)) & Mid(tokens(2), 2, len(tokens(2)) - 1) & ") {" & vbCrLf & vbTab & vbTab & tokens(2) & " = new" & UCase(Mid(tokens(2), 1, 1)) & Mid(tokens(2), 2, len(tokens(2)) - 1) & ";" & vbCrLf & vbTab & "}" & vbCrLf
    End If
    
    classes(classIdx, GETTER_SETTER) = classes(classIdx, GETTER_SETTER) & vbCrLf
End Sub

Sub handleHashcodeAndEquals(tokens)
    If classIdx < 0 Then
        handleError("A class must be specified first!")
    End If
    
    If Not UBound(tokens) >= 1 Then
        handleError("Missing arguments!")
    End If
    
    Dim tempCreated : tempCreated = false
    classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & "public int hashCode() {" & vbCrLf & vbTab & vbTab & "final int prime = 31;" & vbCrLf & vbTab & vbTab & "int result = 1;" & vbCrLf
    
    For tokenIdx = 1 To UBound(tokens) Step 1
        Dim datatype : datatype = getDataType(tokens(tokenIdx))
        
        If isIntegerNumberType(datatype) Then
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "result = prime * result + " & tokens(tokenIdx) & ";" & vbCrLf
        ElseIf datatype = "float" Then
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "result = prime * result + Float.floatToIntBits(" & tokens(tokenIdx) & ");" & vbCrLf
        ElseIf datatype = "double" Then
            If Not tempCreated Then
                classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "long temp;" & vbCrLf
                tempCreated = true
            End If
            
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "temp = Double.doubleToLongBits(" & tokens(tokenIdx) & ");" & vbCrLf
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "result = prime * result + (int) (temp ^ (temp >>> 32));" & vbCrLf
        ElseIf datatype = "boolean" Then
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "result = prime * result + (" & tokens(tokenIdx) & " ? 1231 : 1237);" & vbCrLf
        Else
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "result = prime * result + " & tokens(tokenIdx) & ".hashCode();" & vbCrLf
        End If
    Next
    
    classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & vbTab & "return result;" & vbCrLf & vbTab & "}" & vbCrLf & vbCrLf
    
    classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & "public boolean equals(Object obj) {" & vbCrLf & vbTab & vbTab & "if(this == obj)" & vbCrLf & vbTab & vbTab & vbTab & "return true;" & vbCrLf & vbTab & vbTab & "if(obj == null || !(obj instanceof " & classes(classIdx, CLASSNAME) & "))" & vbCrLf & vbTab & vbTab & vbTab & "return false;" & vbCrLf & vbTab & vbTab & "if(this.hashCode() == ((" & classes(classIdx, CLASSNAME) & ")obj).hashCode())" & vbCrLf & vbTab & vbTab & vbTab & "return true;" & vbCrLf & vbTab & "}" & vbCrLf & vbCrLf
End Sub

Sub handleToString(tokens)
    If classIdx < 0 Then
        handleError("A class must be specified first!")
    End If
    
    If Not UBound(tokens) >= 1 Then
        handleError("Missing arguments!")
    End If
    
    classes(classIdx, METHODS) = classes(classIdx, METHODS) & vbTab & "public String toString() {" & vbCrLf & vbTab & vbTab & "return " & chr(34) & classes(classIdx, CLASSNAME) & " [ " & tokens(1) & "=" & chr(34) & " + " &  tokens(1)
    
    If needsToString(getDataType(tokens(1))) Then
        classes(classIdx, METHODS) = classes(classIdx, METHODS) & ".toString()"
    End If
    
    
    For idx = 2 To UBound(tokens) Step 1
        classes(classIdx, METHODS) = classes(classIdx, METHODS) & " + " & chr(34) & ", " & tokens(idx) & "=" & chr(34) & " + " &  tokens(idx)
        
        If needsToString(getDataType(tokens(idx))) Then
            classes(classIdx, METHODS) = classes(classIdx, METHODS) & ".toString()"
        End If
    Next
    
    classes(classIdx, METHODS) = classes(classIdx, METHODS) & " + " & chr(34) & " ]" & chr(34) & ";" & vbCrLf & vbTab & "}" & vbCrLf & vbCrLf
End Sub

Function getAllFields(classToUse)
    getAllFields = classes(classToUse, FIELDS)
    getAllFields = Join(Split(getAllFields, vbCrLf & vbTab), "")
    getAllFields = Join(Split(getAllFields, " = "), " ")
    getAllFields = Join(Split(getAllFields, vbTab & "private "), "")
    getAllFields = Join(Split(getAllFields, "private "), "")
    getAllFields = Join(Split(getAllFields, ";" & vbCrLf), "")
End Function



Sub initialiseClass()
    classIdx = nextClassIdx
    nextClassIdx = nextClassIdx + 1
    
    classes(classIdx, CLASSNAME) = ""
    classes(classIdx, PACKAGE) = ""
    classes(classIdx, CLASS_HEAD) = ""
    classes(classIdx, SUPERCLASS) = ""
    classes(classIdx, FIELDS) = ""
    classes(classIdx, GETTER_SETTER) = ""
    classes(classIdx, METHODS) = ""
End Sub

Sub createPackageFolders(packageName)
    currOutFile = outDir
    
    For Each folder In Split(packageName, ".")
        If Not fs.folderExists(currOutFile & folder) Then
            fs.CreateFolder(currOutFile & folder)
        End If
        
        currOutFile = currOutFile & folder & "/"
    Next
End Sub

Sub addAccessLevel(str, modifier)
    Select Case modifier
        Case "+"
            str = str & "public "
        Case "_"
            str = str & "protected "
        Case "-"
            str = str & "private "
    End Select
End Sub

Function getDataType(field)
    Dim fieldsArray
    Dim foundIdx : foundIdx = -1
    Dim tempClassIdx : tempClassIdx = classIdx

    Do 
        fieldsArray = Split(Join(Split(classes(tempClassIdx, FIELDS), ";" & vbCrLf), " "), " ")
        foundIdx = indexOf(fieldsArray, field)
        tempClassIdx = getClassIdx(classes(tempClassIdx, SUPERCLASS))
    Loop While foundIdx < 1 And tempClassIdx >= 0
    
    If foundIdx > 0 Then
        getDataType = fieldsArray(foundIdx - 1)
    Else
        handleError("Invalid field: " & field)
    End If
End Function

Function isIntegerNumberType(datatype)
    isIntegerNumberType = (datatype = "byte" Or datatype = "char" Or datatype = "short" Or datatype = "int" Or datatype = "long")
End Function

Function needsToString(datatype)
    needsToString =  Not (isIntegerNumberType(datatype) Or datatype = "boolean" Or datatype = "float" Or datatype = "double" Or datatype = "String")
End Function



Function indexOf(array,value)
    Dim idx : idx = 0
    indexOf = -1

    Do While idx < UBound(array) AND indexOf = -1 
        If StrComp(array(idx), value) = 0 Then
            indexOf = idx
        End If
        idx = idx + 1
    Loop
End Function

Function getClassIdx(classToFind)
    Dim idx : idx = 0
    getClassIdx = -1
    
    If len(classToFind) > 0 Then
        Do While idx < UBound(classes, 1) AND getClassIdx = -1 
            If StrComp(classes(idx, CLASSNAME), classToFind) = 0 Then
                getClassIdx = idx
            End If
            idx = idx + 1
        Loop
    End If
End Function