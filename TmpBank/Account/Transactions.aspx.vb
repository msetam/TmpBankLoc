Imports TmpBankService.Models
Imports TmpBankService.Logic

Namespace Pages
    Public Class Transactions
        Inherits Utils.RestrictedPage

        Protected Overrides ReadOnly Property AcceptedRoles As RoleType()
            Get
                Return {RoleType.COSTUMER, RoleType.ADMIN}
            End Get
        End Property

        Protected Overrides ReadOnly Property UserActions As TmpBankService.Logic.UserActions
            Get
                Return New TmpBankService.Logic.UserActions()
            End Get
        End Property


        Public Function TransactionsGrid_GetData() As ICollection(Of TmpBankService.Models.Transaction)
            Return TmpBankService.Utils.IdentityUtils.CurrentUser(UserActions).Transactions
        End Function


    End Class
End Namespace