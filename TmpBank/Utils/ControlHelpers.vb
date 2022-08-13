Imports System.Runtime.CompilerServices

Namespace Utils

    Module ControlExtensions


        Private Class ControlWithAttribute
            Property Control() As Control
            Property Attributes() As AttributeCollection

        End Class


        ' support UserControl, HtmlControl and WebControl 
        ' stopOnFirstHit: if control has many descendants that match the attribute 'key' we stop on the first detection
        <Extension()>
        Public Iterator Function FindControlByAttribute(control As Control, key As String, Optional stopOnFirstHit As Boolean = False) As IEnumerable(Of Control)
            Dim current = _CreateControlWithAttr(control)

            Dim k = current.Attributes?(key)

            If k IsNot Nothing Then
                Yield current.Control
                If stopOnFirstHit Then Return
            End If

            If control.HasControls() Then

                For Each c As Control In control.Controls
                    For Each item As Control In c.FindControlByAttribute(key, stopOnFirstHit)
                        Yield item
                        If stopOnFirstHit Then Return
                    Next
                Next
            End If

        End Function

        <Extension()>
        Public Iterator Function FindControlByAttribute(control As Control, key As String, value As String, Optional stopOnFirstHit As Boolean = False) As IEnumerable(Of Control)
            Dim current = _CreateControlWithAttr(control)

            Dim k = current.Attributes?(key)
            If k IsNot Nothing AndAlso k = value Then Yield current.Control
            If stopOnFirstHit Then
                Return
            End If


            If control.HasControls() Then

                For Each c As Control In control.Controls

                    For Each item As Control In c.FindControlByAttribute(key, value)
                        Yield item
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


    End Module


End Namespace
