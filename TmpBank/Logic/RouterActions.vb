Imports System.Web.Http

Namespace Logic
    Public Module RouterActions


        Private CustomHandledErrorCodes As List(Of Integer) = New List(Of Integer) From {403}

        Public Sub AddCustomRoutes(routesCollection As RouteCollection)

            AddAccountRoutes(routesCollection)
            AddErrorRoutes(routesCollection)

            routesCollection.MapPageRoute(
                "AccountEntry",
                "account/entry",
                "~/AccountEntry.aspx",
                True
                )

            routesCollection.MapPageRoute(
                "AccountSignOut",
                "account/signout",
                "~/SignOut.aspx",
                True
                )
            routesCollection.MapPageRoute(
                "Home",
                "",
                "~/Default.aspx",
                True
                )
        End Sub


        Public Sub AddAccountRoutes(routesCollection As RouteCollection)
            routesCollection.MapPageRoute(
                "AccountHome",
                "account/user/{Username}/home",
                "~/Account/Transactions.aspx",
                True,
                New RouteValueDictionary(New With {.TKey = "Username", .TValue = "user"})
                )

            routesCollection.MapPageRoute(
                "AccountTransactions",
                "account/user/{Username}/transactions",
                "~/Account/Transactions.aspx",
                True,
                New RouteValueDictionary(New With {.TKey = "Username", .TValue = "user"})
                )
            routesCollection.MapPageRoute(
                "AccountFindUsers",
                "account/user/{Username}/find",
                "~/Account/FindUser.aspx",
                True
                )
        End Sub


        Public Sub AddErrorRoutes(routesCollection As RouteCollection)
            routesCollection.MapPageRoute(
                "Errors",
                "errors/general",
                "~/Errors/GeneralError.aspx",
                True
                )
            For Each errorCode In RouterActions.CustomHandledErrorCodes
                routesCollection.MapPageRoute(
                       $"Errors{errorCode}",
                       $"errors/code-{errorCode}",
                       $"~/Errors/Error{errorCode}.aspx",
                       True
                )
            Next
        End Sub


        ' returns true if we have added a custom handler for the provided errorCode
        Public Function HandlesError(errorCode As Integer) As Boolean
            Return RouterActions.CustomHandledErrorCodes.Contains(errorCode)
        End Function

    End Module
End Namespace