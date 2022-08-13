Option Strict On

Imports TmpBankService.Logic
Imports TmpBankService.Utils

Namespace Pages
    Public Class AccountEntry
        Inherits System.Web.UI.Page

        Friend Shared UserNameFieldName As String = "username"
        Friend Shared PasswordFieldName As String = "password"
        Friend Shared EmailFieldName As String = "email"

        Protected _IsLoginValid As Boolean = True
        Protected _IsSignupValid As Boolean = True

        Protected Const FORM_METHOD = "form_method"
        Protected Const FORM_RESULT = "form_result"


        Protected Sub Page_Init(ByVal sender As Object, ByVal e As EventArgs) Handles Me.Init

            If TmpBankService.Utils.IdentityUtils.IsCurrentUserAuthenticated Then
                Response.Redirect(_GetSuccessRedirectUrl(TmpBankService.Utils.IdentityUtils.CurrentUser().UserName))
                Return
            End If

        End Sub

        Protected Sub SetSignupValidationStatus(signupResult As String)
            SignupValidationResult_View.Text = signupResult
            _IsSignupValid = False
        End Sub

        Protected Sub SetLoginValidationStatus(loginResult As String)
            LoginValidationResult_View.Text = loginResult
            _IsLoginValid = False
        End Sub


        ' returns true if validated and doesn't touch the validationResult otherwise sets the
        ' validation result to corresponding value and returns false
        Public Function ValidateInputStringExists(fieldName As String, value As String,
                                                  ByRef validationResult As String) As Boolean
            If String.IsNullOrEmpty(value) Then
                validationResult = $"field {fieldName} is required"
                Return False
            End If
            Return True
        End Function


        Private Function _GetSuccessRedirectUrl(username As String) As String
            Dim redirectToUrl As String = Request.QueryString("ReturnUrl")
            If Not String.IsNullOrEmpty(redirectToUrl) Then
                Return redirectToUrl
            End If
            Return GetRouteUrl("AccountHome", New With {.Username = username})
        End Function

        Private Sub _Login() Handles DigSig_UC.Submit ' or LoginBtn_View.Click
            Dim loginResult As String = ""
            If Not ValidateInputStringExists("UserNameL", UserNameLogin_View.Value, loginResult) OrElse
                Not ValidateInputStringExists("PassowordL", PasswordLogin_View.Value, loginResult) Then
                SetLoginValidationStatus(loginResult)
                Return
            End If

            Dim username As String = UserNameLogin_View.Value
            Dim password As String = PasswordLogin_View.Value
            Using userActions As New UserActions
                Dim loginResultEnum = userActions.Login(username.Trim, password.Trim)
                If loginResultEnum = UserActionStatus.USER_LOGGED_IN Then
                    Response.Redirect(_GetSuccessRedirectUrl(TmpBankService.Utils.IdentityUtils.CurrentUser(userActions).UserName))
                    Return
                End If
                SetLoginValidationStatus(loginResultEnum.ToString())
            End Using
        End Sub

        Private Sub _Signup() Handles SignUpBtn_View.Click
            Dim signupResult As String = ""
            If Not ValidateInputStringExists("UserNameS", UsernameSignup_View.Value, signupResult) OrElse
                 Not ValidateInputStringExists("PasswordS", PasswordSignup_View.Value, signupResult) OrElse
                 Not ValidateInputStringExists("EmailS", EmailSignup_View.Value, signupResult) Then
                SetSignupValidationStatus(signupResult)
                Return
            End If
            Dim username As String = UsernameSignup_View.Value
            Dim password As String = PasswordSignup_View.Value
            Dim email As String = EmailSignup_View.Value
            Using userActions As New UserActions
                Dim signupResultEnum = userActions.SignUp(username.Trim, password.Trim, email.Trim)
                If signupResultEnum = UserActionStatus.USER_SIGNED_UP Then
                    Response.Redirect(_GetSuccessRedirectUrl(TmpBankService.Utils.IdentityUtils.CurrentUser(userActions).UserName))
                    Return
                End If
                SetSignupValidationStatus(signupResultEnum.ToString())
            End Using
        End Sub
    End Class
End Namespace