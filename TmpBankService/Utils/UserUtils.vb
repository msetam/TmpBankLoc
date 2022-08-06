Imports System.Runtime.CompilerServices
Imports TmpBankService.Models

Namespace Utils
    Module UserUtils
        Public Function CreateAnonymousUser() As User
            Return New User With {
                .UserName = "user",
                .Email = "unknown",
                .UserId = Models.User.ANONYMOUS_USER_ID
                }
        End Function
    End Module
End Namespace
