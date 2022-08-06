Imports System.ComponentModel
Imports System.Web.Services
Imports System.Web.Services.Protocols
Imports TmpBankService.Models

Namespace Service
    ' To allow this Web Service to be called from script, using ASP.NET AJAX, uncomment the following line.
    <System.Web.Services.WebService(Namespace:="http://localhost:5288")>
    <System.Web.Services.WebServiceBinding(ConformsTo:=WsiProfiles.BasicProfile1_1)>
    <ToolboxItem(False)>
    <System.Web.Script.Services.ScriptService()>
    Public Class DigitalSigService
        Inherits System.Web.Services.WebService

        Private Const DIGITAL_SIG_KEY = "dig_sig_key"

        <WebMethod(EnableSession:=True)>
        Public Function InitiateDigSigVerification(data As Object, expectedResult As Models.DigSigStatus, waitTime As Integer) As String
            Dim user = GetUser()
            Dim requestCode = user.GenerateRequestCode(data, waitTime, expectedResult)
            Session(DIGITAL_SIG_KEY) = user
            Return requestCode
        End Function


        <WebMethod(EnableSession:=True)>
        Public Function CheckDigSigStatus(requestCode As Integer) As Models.DigitalSigResponse
            Dim user = GetUser()
            If user Is Nothing Then
                Return Nothing
            End If
            Dim digSigRequest = user.RequestCodes.SingleOrDefault(Function(req) req.Code = requestCode)
            If digSigRequest Is Nothing Then
                Return Nothing
            End If

            Dim response = New DigitalSigResponse() With {
                                                    .RequestCode = requestCode,
                                                    .Status = If(
                                                        digSigRequest.HasTimedOut(),
                                                        digSigRequest.ExpectedResult,
                                                        Models.DigSigStatus.WAITING
                                                        )
                                                    }

            If digSigRequest.HasTimedOut AndAlso digSigRequest.ExpectedResult = DigSigStatus.SUCCEEDED Then
                Using userActions As New Logic.UserActions()
                    Dim resulting_user = userActions.FindUser(digSigRequest.Data)
                    If resulting_user IsNot Nothing Then
                        Utils.IdentityUtils.Login(resulting_user)
                    Else
                        response.Status = DigSigStatus.FAILED
                    End If
                End Using

            End If
            Return response

        End Function

        Private Function GetUser() As Models.DigSigUser
            Dim user = Session(DIGITAL_SIG_KEY)
            If user Is Nothing Then
                user = New Models.DigSigUser()
                Session(DIGITAL_SIG_KEY) = user
            End If
            Return user
        End Function


    End Class
End Namespace
