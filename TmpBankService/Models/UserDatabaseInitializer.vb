Imports System.Data.Entity


Namespace Models
    Public Class UserDatabaseInitializer
        Inherits DropCreateDatabaseIfModelChanges(Of UserContext)
        Implements IDisposable

        Private _cryptoGraphyUtils As New Utils.CryptographyUtils

        Protected Overrides Sub Seed(context As UserContext)
            'Dim userManager As CustomUserManager = New CustomUserManager()
            For Each user In CreateUsers()
                context.Users.Add(user)
                ' userManager.AddToRoleAsync(user.UserId, RoleType.COSTUMER.ToString())
                CreateTransactionsForUser(user).ForEach(Sub(transaction) context.Transactions.Add(transaction))
                CreateUserRole(user).ForEach(Sub(role) context.Roles.Add(role))
            Next
        End Sub

        Private Function CreateUsers() As List(Of User)
            Return New List(Of User) From {
                New User() _
                    With {.UserId = 1, .UserName = "user", .Email = "user@gmail.com",
                        .HashedPassword = _cryptoGraphyUtils.GenerateSaltedHash("user",
                                                                                _cryptoGraphyUtils.CreateNewSalt(10))},
                New User() _
                    With {.UserId = 2, .UserName = "admin", .Email = "admin@gmail.com",
                        .HashedPassword = _cryptoGraphyUtils.GenerateSaltedHash("admin",
                                                                                _cryptoGraphyUtils.CreateNewSalt(10))}
                }
        End Function



        Private Function CreateUserRole(user As User) As List(Of Role)
            If user.UserName = "user" Then
                Return New List(Of Role) From {New Role With {.UserId = user.UserId, .RoleValue = RoleType.COSTUMER}}
            ElseIf user.UserName = "admin" Then
                Return New List(Of Role) From {
                    New Role With {.UserId = user.UserId, .RoleValue = RoleType.COSTUMER},
                    New Role With {.UserId = user.UserId, .RoleValue = RoleType.ADMIN}
                }
            End If
            Return New List(Of Role) From {New Role With {.UserId = user.UserId, .RoleValue = RoleType.COSTUMER}}
        End Function

        Private Function CreateTransactionsForUser(user As User) As List(Of Transaction)
            Return New List(Of Transaction) From {
                New Transaction() _
                    With {.Method = TransactionMethod.INTEREST, .Type = TransactionType.PAYA, .Amount = user.UserId * 1000,
                        .UserId = user.UserId, .ToUserId = If(user.UserId = 1, 2, 1)},
                New Transaction() _
                    With {.Method = TransactionMethod.TRANSFER, .Type = TransactionType.PAYA, .Amount = user.UserId * 1000,
                        .UserId = user.UserId, .ToUserId = If(user.UserId = 1, 2, 1)},
                New Transaction() _
                    With {.Method = TransactionMethod.RECEIVE, .Type = TransactionType.PAYA, .Amount = user.UserId * 1000,
                        .UserId = user.UserId, .ToUserId = If(user.UserId = 1, 2, 1)}
                }
        End Function

        Public Sub Dispose() Implements IDisposable.Dispose
            If _cryptoGraphyUtils IsNot Nothing Then
                _cryptoGraphyUtils.Dispose()
                _cryptoGraphyUtils = Nothing
            End If
        End Sub

    End Class
End Namespace
