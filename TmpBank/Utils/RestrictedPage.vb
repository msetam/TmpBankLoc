Imports TmpBankService.Models
Imports TmpBankService.Logic
Imports TmpBankService.Utils

Namespace Utils
    Public MustInherit Class RestrictedPage
        Inherits Page


        Protected MustOverride ReadOnly Property AcceptedRoles As RoleType()

        Protected Overridable ReadOnly Property UserActions As UserActions
            Get
                Return Nothing
            End Get
        End Property

        Protected Overridable ReadOnly Property AllRolesShoudlExist As Boolean
            Get
                Return False
            End Get
        End Property

        Protected Overridable ReadOnly Property ErrorCodeOnAccessDenied As Int16
            Get
                Return 403
            End Get
        End Property

        Overridable Sub Page_PreInit(sender As Object, e As EventArgs) Handles Me.PreInit
            RestrictAccess(AcceptedRoles, AllRolesShoudlExist, ErrorCodeOnAccessDenied)
        End Sub

        Public Sub RestrictAccess(accessRoles() As RoleType, allRolesShouldExist As Boolean, errorCode As Integer)
            Dim currentJWT = TmpBankService.Utils.IdentityUtils.GetCurrentContextJWT()
            If TmpBankService.Utils.IsJwtValid(currentJWT) Then
                If accessRoles.Count = 0 Then
                    Return
                End If
                Dim rolesExisted(accessRoles.Count - 1) As Boolean
                For i As Integer = 0 To accessRoles.Count - 1
                    For Each userRole In currentJWT.Claims
                        If userRole = accessRoles(i) Then
                            rolesExisted(i) = True
                            If Not allRolesShouldExist Then
                                Return
                            End If
                            Exit For
                        End If
                    Next
                    If Not rolesExisted.All(Function(bool) bool) Then
                        Throw New HttpException(errorCode, "403 error")
                        Return
                    End If
                Next
            End If
            Response.Redirect(Page.GetRouteUrl("AccountEntry", New With {.ReturnUrl = Page.GetRouteUrl("AccountHome", Nothing)}))
        End Sub

        Public Sub RestrictAccess(accessRole As RoleType, Optional allRolesShouldExist As Boolean = False, Optional errorCode? As Integer = Nothing)
            RestrictAccess({accessRole}, allRolesShouldExist, errorCode)
        End Sub

        Private Sub Page_Unload() Handles Me.Unload
            If UserActions IsNot Nothing Then
                UserActions.Dispose()
            End If
        End Sub

    End Class
End Namespace
