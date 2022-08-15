Imports System.Runtime.CompilerServices

Namespace Utils

    Module ControlExtensions


        Public Class ControlWithAttribute
            Property Control() As Control
            Property Attributes() As AttributeCollection

        End Class

        Public Class ControlWithCssClass
            Property Control() As Control
            Property Css() As String

        End Class


        ' support UserControl, HtmlControl and WebControl 
        ' stopOnFirstHit: if control has many descendants that match the attribute 'key' we stop on the first detection
        <Extension()>
        Public Iterator Function FindControlByAttribute(control As Control, key As String, Optional valueCheckFunc As Func(Of String, Boolean) = Nothing, Optional stopOnFirstHit As Boolean = False) As IEnumerable(Of ControlWithAttribute)
            Dim current = _CreateControlWithAttr(control)

            Dim k = current.Attributes?(key)
            If k IsNot Nothing Then
                If valueCheckFunc Is Nothing Then
                    Yield current
                ElseIf valueCheckFunc(k) Then
                    Yield current
                End If
                If stopOnFirstHit Then
                    Return
                End If
            End If
            If control.HasControls() Then

                For Each c As Control In control.Controls
                    For Each item In c.FindControlByAttribute(key, valueCheckFunc, stopOnFirstHit)
                        Yield item
                        If stopOnFirstHit Then Return
                    Next
                Next
            End If

        End Function

        <Extension()>
        Public Iterator Function FindControlByAttribute(control As Control, key As String, value As String, Optional acceptIfKeyContainsValue As Boolean = False, Optional stopOnFirstHit As Boolean = False) As IEnumerable(Of ControlWithAttribute)
            Dim current = _CreateControlWithAttr(control)

            Dim k = current.Attributes?(key)
            If k IsNot Nothing AndAlso If(acceptIfKeyContainsValue, k.Contains(value), k = value) Then
                Yield current
                If stopOnFirstHit Then
                    Return
                End If
            End If


            If control.HasControls() Then

                For Each c As Control In control.Controls

                    For Each item In c.FindControlByAttribute(key, value)
                        Yield item
                    Next
                Next
            End If
        End Function

        ' support UserControl, HtmlControl and WebControl 
        ' stopOnFirstHit: if control has many descendants that match the attribute 'key' we stop on the first detection
        <Extension()>
        Public Iterator Function FindControlByClass(control As Control, valueCheckFunc As Func(Of String, Boolean), Optional stopOnFirstHit As Boolean = False) As IEnumerable(Of ControlWithCssClass)
            Dim current = _CreateControlWithCssClass(control)

            Dim k = current.Css
            If k IsNot Nothing Then
                If valueCheckFunc Is Nothing Then
                    Yield current
                ElseIf valueCheckFunc(k) Then
                    Yield current
                End If
                If stopOnFirstHit Then
                    Return
                End If
            End If
            If control.HasControls() Then

                For Each c As Control In control.Controls
                    For Each item In c.FindControlByClass(valueCheckFunc, stopOnFirstHit)
                        Yield item
                        If stopOnFirstHit Then Return
                    Next
                Next
            End If

        End Function


        Private Function _CreateControlWithAttr(control As Control) As ControlWithAttribute
            Dim currentHC = TryCast(control, System.Web.UI.HtmlControls.HtmlControl)
            If currentHC IsNot Nothing Then
                Return New ControlWithAttribute With {.Control = currentHC, .Attributes = currentHC.Attributes}
            End If
            Dim currentWC = TryCast(control, System.Web.UI.WebControls.WebControl)
            If currentWC IsNot Nothing Then
                Return New ControlWithAttribute With {.Control = currentWC, .Attributes = currentWC.Attributes}
            End If
            Dim currentUC = TryCast(control, System.Web.UI.UserControl)
            If currentUC IsNot Nothing Then
                Return New ControlWithAttribute With {.Control = currentUC, .Attributes = currentUC.Attributes}
            End If
            Return New ControlWithAttribute() With {.Control = control, .Attributes = Nothing}
        End Function

        ' for user controls we try to get a property name Starting with Css therefore we might get the wrong answer for those.
        ' althout its better to stick to convensions and use CssClass for classes in controls.
        Private Function _CreateControlWithCssClass(control As Control) As ControlWithCssClass
            Dim currentHC = TryCast(control, System.Web.UI.HtmlControls.HtmlControl)
            If currentHC IsNot Nothing Then
                Return New ControlWithCssClass With {.Control = currentHC, .Css = currentHC.Attributes("css")}
            End If
            Dim currentWC = TryCast(control, System.Web.UI.WebControls.WebControl)
            If currentWC IsNot Nothing Then
                Return New ControlWithCssClass With {.Control = currentWC, .Css = currentWC.CssClass}
            End If
            Dim currentUC = TryCast(control, System.Web.UI.UserControl)
            If currentUC IsNot Nothing Then
                Return New ControlWithCssClass() With {.Control = control, .Css = currentUC.GetType().GetProperties().Any(Function(prop) prop.Name = "CssClass" OrElse prop.Name.StartsWith("Css"))}
            End If
            Return New ControlWithCssClass() With {.Control = control, .Css = Nothing}
        End Function



    End Module


End Namespace
