Imports Microsoft.VisualBasic.ApplicationServices
Imports Newtonsoft.Json
Imports TmpBankService.Logic
Imports TmpBankService.Models
Imports User = TmpBankService.Models.User

Namespace Utils
    Public Class IdentityUtils

        Private Const _USER_JWT_COOKIE_NAME = "jwt_token"

        Public Shared Function CurrentUser(Optional userActions As UserActions = Nothing) As User
            Dim dispose = False
            Dim result As Models.User = Nothing ' The CurentUserModel reference

            If userActions Is Nothing Then
                userActions = New UserActions()
                dispose = True
            End If

            Dim currentJWT = GetCurrentContextJWT()
            If currentJWT IsNot Nothing Then
                result = userActions.FindUser(currentJWT.Username)
                If result Is Nothing Then
                    result = Utils.UserUtils.CreateAnonymousUser()
                End If
            Else
                ' No credentials were provided 
                result = Utils.UserUtils.CreateAnonymousUser()
            End If

            If dispose Then
                userActions.Dispose()
            End If

            Return result
        End Function

        Public Shared Function GetCurrentContextJWT() As Utils.JWT

            Dim result As Utils.JWT = Nothing

            Dim cookie = HttpContext.Current.Request.Cookies.Get(_USER_JWT_COOKIE_NAME)
            If cookie IsNot Nothing Then
                result = JsonConvert.DeserializeObject(Of Utils.JWT)(cookie.Value)
            End If

            Return result
        End Function

        Public Shared Sub Login(user As User)
            Dim jwtCookie = New HttpCookie(_USER_JWT_COOKIE_NAME,
                                                Utils.CreateJWT(user.UserName, user.Roles.ToArray()).ToJson()
                                           )
            jwtCookie.Expires = DateTime.Now().AddHours(6)
            HttpContext.Current.Response.Cookies.Add(jwtCookie)
        End Sub

        Public Shared Function IsCurrentUserAuthenticatedStatic() As Boolean
            ' Return CurrentUser().UserId <> User.ANONYMOUS_USER_ID
            Dim currentJWT = GetCurrentContextJWT()
            If currentJWT Is Nothing Then
                Return False
            End If
            Return Utils.JWTUtils.IsJwtValid(currentJWT)
        End Function


        Public Shared Function IsCurrentUserAuthenticated(Optional role? As RoleType = Nothing) As Boolean
            Dim currentJWT = GetCurrentContextJWT()

            If currentJWT Is Nothing Then
                Return False
            End If

            If Utils.JWTUtils.IsJwtValid(currentJWT) Then
                If role.HasValue Then
                    Return currentJWT.Claims.Any(Function(_role) _role = role)
                End If
                Return True
            End If

            Return False
        End Function

        Public Shared Sub SignOut()
            Dim jwtCookie = HttpContext.Current.Request.Cookies.Get(_USER_JWT_COOKIE_NAME)
            If jwtCookie IsNot Nothing Then
                jwtCookie.Expires = DateTime.Now().AddYears(-1)
                HttpContext.Current.Response.Cookies.Add(jwtCookie)
            End If
        End Sub


        Public Shared Function GetUserName() As String
            Return If(GetCurrentContextJWT()?.Username, UserUtils.CreateAnonymousUser().UserName)
        End Function

    End Class

End Namespace