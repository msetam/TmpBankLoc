Imports System.Web
Imports Azure
Imports Newtonsoft.Json
Imports TmpBankService.Models

Namespace Logic
    Public Enum UserActionStatus
        USER_LOGGED_IN
        USER_SIGNED_UP
        USER_SIGNED_OUT
        USER_NOT_AUTHENTICATED
        USER_INVALID_CREDENTIALS
        USERNAME_ALERADY_EXISTS
        EMAIL_ALREADY_EXISTS
    End Enum

    Public Class UserActions
        Implements IDisposable

        Private Const _USER_SESSION_KEY = "UserName"
        Private userContext As New UserContext

        Public Function FindUser(username As String, Optional startsWith As Boolean = False) As Models.User
            If startsWith Then
                Return userContext.Users.Where(Function(u) u.UserName.ToLower.StartsWith(username.ToLower)).FirstOrDefault
            End If
            Return userContext.Users.SingleOrDefault(Function(u) u.UserName = username)
        End Function

        ' all Transaction methods return a boolean indicating transfer was sucessful(true) or not(false)
        Public Function Transfer(ByVal toUser, ByVal amount) As Boolean

            Return False
        End Function


        Public Function Receiver(ByVal fromUser, ByVal amount) As Boolean

            Return False
        End Function

        Public Function UserTrasactions(currentUser As User) As IQueryable(Of Transaction)
            Return userContext.Transactions.Where(Function(t) t.UserId = currentUser.UserId)
        End Function

        ' returns the status of login operation
        Public Function Login(username As String, password As String) As UserActionStatus
            Dim user = UserWithCrenditals(username, password)
            If user IsNot Nothing Then
                'HttpContext.Current.Session(_USER_SESSION_KEY) = username

                Utils.IdentityUtils.Login(user)
                Return UserActionStatus.USER_LOGGED_IN
            End If
            Return UserActionStatus.USER_INVALID_CREDENTIALS
        End Function


        ' returns the status of signup operation
        Public Function SignUp(username As String, password As String, email As String) As UserActionStatus
            Dim user =
                    userContext.Users.SingleOrDefault(Function(_user) _user.UserName = username Or _user.Email = email)
            If user IsNot Nothing Then
                If user.UserName = username Then
                    Return UserActionStatus.USERNAME_ALERADY_EXISTS
                End If
                Return UserActionStatus.EMAIL_ALREADY_EXISTS
            End If
            Using cryptoUtil As New Utils.CryptographyUtils
                userContext.Users.Add(New Models.User() With {.UserName = username,
                                         .HashedPassword = cryptoUtil.GenerateSaltedHash(password,
                                                                                         cryptoUtil.CreateNewSalt()),
                                         .Email = email})
                userContext.SaveChanges()
                ' adding the role to newly created user
                Dim newUser = userContext.Users.SingleOrDefault(Function(_user) _user.UserName = username)
                userContext.Roles.Add(New Role() With {.UserId = newUser.UserId, .RoleValue = RoleType.COSTUMER})
                userContext.SaveChanges()
                'HttpContext.Current.Session(_USER_SESSION_KEY) = username
                Utils.IdentityUtils.Login(newUser)
                Return UserActionStatus.USER_SIGNED_UP
            End Using
        End Function

        Public Function SignOut(Optional dontCheckIfUserIsAuthenticated As Boolean = True)
            If dontCheckIfUserIsAuthenticated OrElse Utils.IdentityUtils.IsCurrentUserAuthenticated() Then
                'HttpContext.Current.Session(_USER_SESSION_KEY) = Nothing
                Utils.IdentityUtils.SignOut()
                Return UserActionStatus.USER_SIGNED_OUT
            End If
            Return UserActionStatus.USER_NOT_AUTHENTICATED
        End Function

        Private Function UserWithCrenditals(username As String, password As String) As User
            Dim user = userContext.Users.Where(Function(_user) _user.UserName = username).FirstOrDefault
            If user IsNot Nothing Then
                Using cryptoUtil As New Utils.CryptographyUtils
                    If String.Compare(cryptoUtil.GenerateSaltedHash(password, user.HashedPassword.Split(":")(0)),
                                      user.HashedPassword) = 0 Then
                        Return user
                    End If
                End Using
            End If
            Return Nothing
        End Function

        Public Sub Dispose() Implements IDisposable.Dispose
            If userContext IsNot Nothing Then
                userContext.Dispose()
                userContext = Nothing
            End If
        End Sub
    End Class
End Namespace