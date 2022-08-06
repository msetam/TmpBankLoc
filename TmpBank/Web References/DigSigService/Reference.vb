﻿'------------------------------------------------------------------------------
' <auto-generated>
'     This code was generated by a tool.
'     Runtime Version:4.0.30319.42000
'
'     Changes to this file may cause incorrect behavior and will be lost if
'     the code is regenerated.
' </auto-generated>
'------------------------------------------------------------------------------

Option Strict Off
Option Explicit On

Imports System
Imports System.ComponentModel
Imports System.Diagnostics
Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports System.Xml.Serialization

'
'This source code was auto-generated by Microsoft.VSDesigner, Version 4.0.30319.42000.
'
Namespace DigSigService
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.8.4084.0"),  _
     System.Diagnostics.DebuggerStepThroughAttribute(),  _
     System.ComponentModel.DesignerCategoryAttribute("code"),  _
     System.Web.Services.WebServiceBindingAttribute(Name:="DigitalSigServiceSoap", [Namespace]:="http://localhost:5288")>  _
    Partial Public Class DigitalSigService
        Inherits System.Web.Services.Protocols.SoapHttpClientProtocol
        
        Private InitiateDigSigVerificationOperationCompleted As System.Threading.SendOrPostCallback
        
        Private CheckDigSigStatusOperationCompleted As System.Threading.SendOrPostCallback
        
        Private useDefaultCredentialsSetExplicitly As Boolean
        
        '''<remarks/>
        Public Sub New()
            MyBase.New
            Me.Url = Global.TmpBank.My.MySettings.Default.TmpBank_DigSigService_DigitalSigService
            If (Me.IsLocalFileSystemWebService(Me.Url) = true) Then
                Me.UseDefaultCredentials = true
                Me.useDefaultCredentialsSetExplicitly = false
            Else
                Me.useDefaultCredentialsSetExplicitly = true
            End If
        End Sub
        
        Public Shadows Property Url() As String
            Get
                Return MyBase.Url
            End Get
            Set
                If (((Me.IsLocalFileSystemWebService(MyBase.Url) = true)  _
                            AndAlso (Me.useDefaultCredentialsSetExplicitly = false))  _
                            AndAlso (Me.IsLocalFileSystemWebService(value) = false)) Then
                    MyBase.UseDefaultCredentials = false
                End If
                MyBase.Url = value
            End Set
        End Property
        
        Public Shadows Property UseDefaultCredentials() As Boolean
            Get
                Return MyBase.UseDefaultCredentials
            End Get
            Set
                MyBase.UseDefaultCredentials = value
                Me.useDefaultCredentialsSetExplicitly = true
            End Set
        End Property
        
        '''<remarks/>
        Public Event InitiateDigSigVerificationCompleted As InitiateDigSigVerificationCompletedEventHandler
        
        '''<remarks/>
        Public Event CheckDigSigStatusCompleted As CheckDigSigStatusCompletedEventHandler
        
        '''<remarks/>
        <System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://localhost:5288/InitiateDigSigVerification", RequestNamespace:="http://localhost:5288", ResponseNamespace:="http://localhost:5288", Use:=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle:=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)>  _
        Public Function InitiateDigSigVerification(ByVal expectedResult As DigSigStatus, ByVal waitTime As Integer) As String
            Dim results() As Object = Me.Invoke("InitiateDigSigVerification", New Object() {expectedResult, waitTime})
            Return CType(results(0),String)
        End Function
        
        '''<remarks/>
        Public Overloads Sub InitiateDigSigVerificationAsync(ByVal expectedResult As DigSigStatus, ByVal waitTime As Integer)
            Me.InitiateDigSigVerificationAsync(expectedResult, waitTime, Nothing)
        End Sub
        
        '''<remarks/>
        Public Overloads Sub InitiateDigSigVerificationAsync(ByVal expectedResult As DigSigStatus, ByVal waitTime As Integer, ByVal userState As Object)
            If (Me.InitiateDigSigVerificationOperationCompleted Is Nothing) Then
                Me.InitiateDigSigVerificationOperationCompleted = AddressOf Me.OnInitiateDigSigVerificationOperationCompleted
            End If
            Me.InvokeAsync("InitiateDigSigVerification", New Object() {expectedResult, waitTime}, Me.InitiateDigSigVerificationOperationCompleted, userState)
        End Sub
        
        Private Sub OnInitiateDigSigVerificationOperationCompleted(ByVal arg As Object)
            If (Not (Me.InitiateDigSigVerificationCompletedEvent) Is Nothing) Then
                Dim invokeArgs As System.Web.Services.Protocols.InvokeCompletedEventArgs = CType(arg,System.Web.Services.Protocols.InvokeCompletedEventArgs)
                RaiseEvent InitiateDigSigVerificationCompleted(Me, New InitiateDigSigVerificationCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState))
            End If
        End Sub
        
        '''<remarks/>
        <System.Web.Services.Protocols.SoapDocumentMethodAttribute("http://localhost:5288/CheckDigSigStatus", RequestNamespace:="http://localhost:5288", ResponseNamespace:="http://localhost:5288", Use:=System.Web.Services.Description.SoapBindingUse.Literal, ParameterStyle:=System.Web.Services.Protocols.SoapParameterStyle.Wrapped)>  _
        Public Function CheckDigSigStatus(ByVal requestCode As Integer) As DigitalSigResponse
            Dim results() As Object = Me.Invoke("CheckDigSigStatus", New Object() {requestCode})
            Return CType(results(0),DigitalSigResponse)
        End Function
        
        '''<remarks/>
        Public Overloads Sub CheckDigSigStatusAsync(ByVal requestCode As Integer)
            Me.CheckDigSigStatusAsync(requestCode, Nothing)
        End Sub
        
        '''<remarks/>
        Public Overloads Sub CheckDigSigStatusAsync(ByVal requestCode As Integer, ByVal userState As Object)
            If (Me.CheckDigSigStatusOperationCompleted Is Nothing) Then
                Me.CheckDigSigStatusOperationCompleted = AddressOf Me.OnCheckDigSigStatusOperationCompleted
            End If
            Me.InvokeAsync("CheckDigSigStatus", New Object() {requestCode}, Me.CheckDigSigStatusOperationCompleted, userState)
        End Sub
        
        Private Sub OnCheckDigSigStatusOperationCompleted(ByVal arg As Object)
            If (Not (Me.CheckDigSigStatusCompletedEvent) Is Nothing) Then
                Dim invokeArgs As System.Web.Services.Protocols.InvokeCompletedEventArgs = CType(arg,System.Web.Services.Protocols.InvokeCompletedEventArgs)
                RaiseEvent CheckDigSigStatusCompleted(Me, New CheckDigSigStatusCompletedEventArgs(invokeArgs.Results, invokeArgs.Error, invokeArgs.Cancelled, invokeArgs.UserState))
            End If
        End Sub
        
        '''<remarks/>
        Public Shadows Sub CancelAsync(ByVal userState As Object)
            MyBase.CancelAsync(userState)
        End Sub
        
        Private Function IsLocalFileSystemWebService(ByVal url As String) As Boolean
            If ((url Is Nothing)  _
                        OrElse (url Is String.Empty)) Then
                Return false
            End If
            Dim wsUri As System.Uri = New System.Uri(url)
            If ((wsUri.Port >= 1024)  _
                        AndAlso (String.Compare(wsUri.Host, "localHost", System.StringComparison.OrdinalIgnoreCase) = 0)) Then
                Return true
            End If
            Return false
        End Function
    End Class
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.8.4084.0"),  _
     System.SerializableAttribute(),  _
     System.Xml.Serialization.XmlTypeAttribute([Namespace]:="http://localhost:5288")>  _
    Public Enum DigSigStatus
        
        '''<remarks/>
        WAITING
        
        '''<remarks/>
        TIMED_OUT
        
        '''<remarks/>
        SUCCEEDED
        
        '''<remarks/>
        FAILED
    End Enum
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Xml", "4.8.4084.0"),  _
     System.SerializableAttribute(),  _
     System.Diagnostics.DebuggerStepThroughAttribute(),  _
     System.ComponentModel.DesignerCategoryAttribute("code"),  _
     System.Xml.Serialization.XmlTypeAttribute([Namespace]:="http://localhost:5288")>  _
    Partial Public Class DigitalSigResponse
        
        Private statusField As DigSigStatus
        
        Private requestCodeField As Integer
        
        '''<remarks/>
        Public Property Status() As DigSigStatus
            Get
                Return Me.statusField
            End Get
            Set
                Me.statusField = value
            End Set
        End Property
        
        '''<remarks/>
        Public Property RequestCode() As Integer
            Get
                Return Me.requestCodeField
            End Get
            Set
                Me.requestCodeField = value
            End Set
        End Property
    End Class
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.8.4084.0")>  _
    Public Delegate Sub InitiateDigSigVerificationCompletedEventHandler(ByVal sender As Object, ByVal e As InitiateDigSigVerificationCompletedEventArgs)
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.8.4084.0"),  _
     System.Diagnostics.DebuggerStepThroughAttribute(),  _
     System.ComponentModel.DesignerCategoryAttribute("code")>  _
    Partial Public Class InitiateDigSigVerificationCompletedEventArgs
        Inherits System.ComponentModel.AsyncCompletedEventArgs
        
        Private results() As Object
        
        Friend Sub New(ByVal results() As Object, ByVal exception As System.Exception, ByVal cancelled As Boolean, ByVal userState As Object)
            MyBase.New(exception, cancelled, userState)
            Me.results = results
        End Sub
        
        '''<remarks/>
        Public ReadOnly Property Result() As String
            Get
                Me.RaiseExceptionIfNecessary
                Return CType(Me.results(0),String)
            End Get
        End Property
    End Class
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.8.4084.0")>  _
    Public Delegate Sub CheckDigSigStatusCompletedEventHandler(ByVal sender As Object, ByVal e As CheckDigSigStatusCompletedEventArgs)
    
    '''<remarks/>
    <System.CodeDom.Compiler.GeneratedCodeAttribute("System.Web.Services", "4.8.4084.0"),  _
     System.Diagnostics.DebuggerStepThroughAttribute(),  _
     System.ComponentModel.DesignerCategoryAttribute("code")>  _
    Partial Public Class CheckDigSigStatusCompletedEventArgs
        Inherits System.ComponentModel.AsyncCompletedEventArgs
        
        Private results() As Object
        
        Friend Sub New(ByVal results() As Object, ByVal exception As System.Exception, ByVal cancelled As Boolean, ByVal userState As Object)
            MyBase.New(exception, cancelled, userState)
            Me.results = results
        End Sub
        
        '''<remarks/>
        Public ReadOnly Property Result() As DigitalSigResponse
            Get
                Me.RaiseExceptionIfNecessary
                Return CType(Me.results(0),DigitalSigResponse)
            End Get
        End Property
    End Class
End Namespace
