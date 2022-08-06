Imports Microsoft.AspNet.Identity
Imports Microsoft.AspNet.Identity.EntityFramework
Imports TmpBankService.Models
Imports TmpBankService.Utils

Namespace Logic
    Public Class RoleActions
        Friend Sub AddUserAndRole()
            ' Dim context As ApplicationDbContext = New ApplicationDbContext()
            ' Dim IdRoleResult As IdentityResult
            ' Dim roleStore = New RoleStore(Of IdentityRole)(context)
            ' Dim roleMgr = New RoleManager(Of IdentityRole)(roleStore)

            'If Not roleMgr.RoleExists(RoleType.COSTUMER) Then
            'IdRoleResult = roleMgr.Create(New IdentityRole With {
            '.Name = RoleType.COSTUMER
            '})
            'End If
        End Sub
    End Class
End Namespace
