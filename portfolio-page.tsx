"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, DollarSign, PieChart, RefreshCw, Plus, BarChart3, Wallet } from "lucide-react"
import { getHoldings } from "@/lib/api"
import { AddHoldingForm } from "@/components/add-holding-form"

interface Holding {
  id: string
  symbol: string
  quantity: number
  avg_price: number
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const [showAddFormState, setShowAddFormState] = useState(false)

  const fetchHoldings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view your portfolio",
          variant: "destructive",
        })
        return
      }

      const data = await getHoldings(token)
      setHoldings(data)
    } catch (error) {
      console.error("Failed to fetch holdings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your holdings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchHoldings()
  }

  const setShowAddForm = (value: boolean) => {
    setShowAddFormState(value)
  }

  useEffect(() => {
    fetchHoldings()
  }, [])

  // Calculate portfolio metrics
  const calculatePortfolioStats = () => {
    if (holdings.length === 0) {
      return {
        totalValue: 0,
        totalHoldings: 0,
        averagePrice: 0,
        uniqueSymbols: 0,
      }
    }

    const totalValue = holdings.reduce((sum, holding) => sum + holding.quantity * holding.avg_price, 0)
    const totalQuantity = holdings.reduce((sum, holding) => sum + holding.quantity, 0)
    const uniqueSymbols = new Set(holdings.map((h) => h.symbol)).size
    const averagePrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

    return {
      totalValue,
      totalHoldings: holdings.length,
      averagePrice,
      uniqueSymbols,
    }
  }

  const stats = calculatePortfolioStats()

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              Portfolio Summary
            </h1>
            <p className="text-gray-600 mt-1">Track and manage your investment holdings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Portfolio Value</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on average purchase prices</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Holdings</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalHoldings}</div>
              <p className="text-xs text-gray-500 mt-1">Individual positions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Symbols</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.uniqueSymbols}</div>
              <p className="text-xs text-gray-500 mt-1">Different assets</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Price</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${stats.averagePrice.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Weighted average</p>
            </CardContent>
          </Card>
        </div>

        {showAddFormState && (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Add New Holding</CardTitle>
              <CardDescription>Add a new stock or investment to your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <AddHoldingForm
                onSuccess={() => {
                  setShowAddForm(false)
                  fetchHoldings() // Refresh the holdings list
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Holdings Table */}
        {holdings.length === 0 ? (
          <EmptyState setShowAddForm={setShowAddForm} />
        ) : (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Your Holdings</CardTitle>
              <CardDescription>Detailed view of all your investment positions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <th className="text-left p-4 font-medium text-gray-700">Asset</th>
                      <th className="text-right p-4 font-medium text-gray-700">Quantity</th>
                      <th className="text-right p-4 font-medium text-gray-700">Avg. Price</th>
                      <th className="text-right p-4 font-medium text-gray-700">Total Value</th>
                      <th className="text-right p-4 font-medium text-gray-700">Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => {
                      const totalValue = holding.quantity * holding.avg_price
                      const allocation = stats.totalValue > 0 ? (totalValue / stats.totalValue) * 100 : 0

                      return (
                        <tr
                          key={holding.id}
                          className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {holding.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{holding.symbol}</div>
                                <div className="text-sm text-gray-500">Stock</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-medium text-gray-900">{holding.quantity.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">shares</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-medium text-gray-900">${holding.avg_price.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">per share</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="font-semibold text-gray-900">
                              $
                              {totalValue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(allocation, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                                {allocation.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyState({ setShowAddForm }: { setShowAddForm: (value: boolean) => void }) {
  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <PieChart className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No holdings yet</h3>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          Start building your portfolio by adding your first investment holding. Track your assets and monitor their
          performance.
        </p>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Your First Holding
        </Button>
      </CardContent>
    </Card>
  )
}
