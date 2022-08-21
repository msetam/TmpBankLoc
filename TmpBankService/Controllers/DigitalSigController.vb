Imports System.Net
Imports System.Net.Http
Imports System.Web.Http
Imports System.Web.Http.Cors
Imports TmpBankService.Models
Imports HttpGetAttribute = System.Web.Http.HttpGetAttribute



<EnableCors("http://localhost:7879", "*", "*", SupportsCredentials:=True)>
Public Class DigitalSigController
    Inherits ApiController

    Private Const DIGITAL_SIG_KEY = "dig_sig_key"
    Private Const INVALID_REQUEST_CODE = -1

    ' POST api/digitalsig/init/{username}
    <HttpPost>
    Public Function Init(username As String) As HttpResponseMessage

        Dim user = _GetUser(username)

        If user Is Nothing Then
            Return Request.CreateResponse(HttpStatusCode.NotFound, "username not found")
        End If

        Dim requestCode = user.GenerateRequestCode(username, 10000, Models.DigSigStatus.SUCCEEDED)
        HttpContext.Current.Session(DIGITAL_SIG_KEY) = user
        Return Request.CreateResponse(HttpStatusCode.OK, user.RequestCodes.SingleOrDefault(Function(req) req.Code = requestCode))
    End Function

    <HttpPost>
    Public Function Check(requestCode As Integer) As HttpResponseMessage
        Dim user = _GetUser(Nothing)
        If user Is Nothing Then
            Return Request.CreateResponse(HttpStatusCode.NotFound, New DigitalSigResponse() With {
                                                    .RequestCode = INVALID_REQUEST_CODE,
                                                    .Status = Models.DigSigStatus.FAILED,
                                                    .Description = "user not found"
                                                    })
        End If
        Dim digSigRequest = user.RequestCodes.SingleOrDefault(Function(req) req.Code = requestCode)
        If digSigRequest Is Nothing Then
            Return Request.CreateResponse(HttpStatusCode.NotFound, New DigitalSigResponse() With {
                                                    .RequestCode = INVALID_REQUEST_CODE,
                                                    .Status = Models.DigSigStatus.FAILED,
                                                    .Description = "user's requestCode not found"
                                                    })
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
        Return Request.CreateResponse(HttpStatusCode.OK, response)

    End Function

    Private Function _GetUser(username As String) As Models.DigSigUser
        Dim user As Models.DigSigUser = HttpContext.Current.Session(DIGITAL_SIG_KEY)
        If user IsNot Nothing Then
            Return user
        End If
        If username Is Nothing Then
            Return Nothing
        End If
        Using userActions As New TmpBankService.Logic.UserActions()
            Dim result = userActions.FindUser(username, True)
            If result IsNot Nothing Then
                user = New Models.DigSigUser() With {.UserName = result.UserName}
                HttpContext.Current.Session(DIGITAL_SIG_KEY) = user
                Return user
            End If
            Return Nothing
        End Using
    End Function
End Class
