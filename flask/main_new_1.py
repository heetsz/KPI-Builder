# KPI Analysis Agent for Startups
# This implementation uses Google's Gemini 2.0 Flash API and web search for KPI analysis

import os
import json
import time
import re
from datetime import datetime
from typing import Dict, List, Any, Tuple
from dotenv import load_dotenv
import threading

# Google Gemini API
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# For news fetching and web search
import requests
from requests.exceptions import RequestException
import feedparser
from bs4 import BeautifulSoup

# For search utilities
import urllib.parse


class IndustryBenchmarkFetcher:
    """
    Fetches industry benchmarks from the web using search techniques.
    """

    def __init__(self, user_agent=None):
        """
        Initialize the benchmark fetcher with request settings.

        Args:
            user_agent (str, optional): User agent for requests. Defaults to a standard one.
        """
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': user_agent or 'Mozilla/5.0 (compatible; StartupAnalyzer/0.1; Educational Project)',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'en-US,en;q=0.9'
        })

        # Cache for benchmark data
        self.benchmark_cache = {}

    def fetch_benchmarks_for_kpis(self, industry: str, stage: str, kpi_list: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Fetch benchmark data for specified KPIs in an industry.

        Args:
            industry (str): Industry name (e.g., "SaaS", "HealthTech")
            stage (str): Company stage (e.g., "Seed", "Series A")
            kpi_list (List[str]): List of KPI names to search benchmarks for

        Returns:
            Dict with KPI names as keys and benchmark info as values
        """
        # Check cache first
        cache_key = f"{industry.lower()}_{stage.lower()}"
        if cache_key in self.benchmark_cache:
            cached_data = self.benchmark_cache[cache_key]
            # Filter for requested KPIs
            return {k: v for k, v in cached_data.items() if k in kpi_list}

        # Results container
        results = {}

        # Rate limiting
        requests_made = 0
        max_requests = 5  # Limit total search requests

        for kpi in kpi_list:
            if requests_made >= max_requests:
                break

            # Normalize KPI name for search
            kpi_search_term = kpi.replace('_', ' ')

            # Skip if already in results
            if kpi in results:
                continue

            # Create search query
            search_query = f"{industry} startup {stage} stage {kpi_search_term} benchmark average"

            # Fetch search results
            try:
                if requests_made > 0:
                    time.sleep(2)  # Rate limiting

                benchmark_data = self._search_and_extract_benchmark(search_query, kpi_search_term)
                requests_made += 1

                if benchmark_data:
                    results[kpi] = benchmark_data
            except Exception as e:
                print(f"Error fetching benchmark for {kpi}: {e}")

        # Cache results
        self.benchmark_cache[cache_key] = results

        return results

    def _search_and_extract_benchmark(self, search_query: str, kpi_term: str) -> Dict[str, Any]:
        """
        Perform a search and extract benchmark information.

        Args:
            search_query (str): The search query
            kpi_term (str): The KPI term to look for in results

        Returns:
            Dict with benchmark information or empty dict if none found
        """
        # This is a simplified search implementation
        # In production, you would use a proper search API like Google Custom Search API or Bing Web Search API

        # For educational purposes, we're using a public search API that doesn't require authentication
        # Note: In production, use official APIs with proper authentication
        encoded_query = urllib.parse.quote(search_query)
        search_url = f"https://duckduckgo.com/html/?q={encoded_query}"

        try:
            response = self.session.get(search_url, timeout=10)
            response.raise_for_status()

            # Parse the search results
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extract search results
            search_results = soup.select('.result__body')

            for result in search_results[:3]:  # Check top 3 results
                # Get URL and title
                link_tag = result.select_one('.result__a')
                if not link_tag:
                    continue

                title = link_tag.text
                url_tag = result.select_one('.result__url')

                # Extract the URL
                url = ""
                if url_tag:
                    url = url_tag.text
                else:
                    href = link_tag.get('href', '')
                    if href and 'http' in href:
                        url = href

                # Get snippet
                snippet_tag = result.select_one('.result__snippet')
                snippet = snippet_tag.text if snippet_tag else ""

                # Check if this result likely contains benchmark information
                if self._has_benchmark_indicators(title, snippet, kpi_term):
                    # Extract potential benchmark values
                    benchmark_values = self._extract_benchmark_values(snippet, kpi_term)

                    if benchmark_values:
                        return {
                            "value": benchmark_values.get("value"),
                            "range": benchmark_values.get("range"),
                            "source_title": title,
                            "source_snippet": snippet,
                            "source_url": url
                        }

            # If no good results found, return empty dict
            return {}

        except RequestException as e:
            print(f"Search request error: {e}")
            return {}

    def _has_benchmark_indicators(self, title: str, snippet: str, kpi_term: str) -> bool:
        """Check if the result likely contains benchmark information."""
        text = (title + " " + snippet).lower()
        kpi_terms = kpi_term.lower().split()

        # Check for benchmark indicators
        benchmark_indicators = ["benchmark", "average", "median", "typical", "standard", "industry"]

        # Check if all KPI terms are present
        has_kpi_terms = all(term in text for term in kpi_terms)

        # Check if any benchmark indicator is present
        has_benchmark_indicator = any(indicator in text for indicator in benchmark_indicators)

        # Check for presence of numbers which might indicate benchmark values
        has_numbers = bool(re.search(r'\d+\.?\d*%?', text))

        return has_kpi_terms and (has_benchmark_indicator or has_numbers)

    def _extract_benchmark_values(self, text: str, kpi_term: str) -> Dict[str, Any]:
        """Extract potential benchmark values from text."""
        # Convert to lowercase for case-insensitive matching
        text_lower = text.lower()
        kpi_term_lower = kpi_term.lower()

        # Simple pattern matching for common formats
        # Looking for formats like "average is 20%" or "typically 15-25%" or "benchmark: 3.5"

        # Different patterns based on KPI type
        patterns = [
            # Percentage patterns
            r'(?:' + kpi_term_lower + r'|benchmark|average|median|typical).*?(\d+\.?\d*\s*%)' if 'rate' in kpi_term_lower or 'score' in kpi_term_lower else None,
            # Number patterns
            r'(?:' + kpi_term_lower + r'|benchmark|average|median|typical).*?(\d+\.?\d*)' if not (
                        'rate' in kpi_term_lower or 'score' in kpi_term_lower) else None,
            # Range patterns
            r'(?:' + kpi_term_lower + r'|benchmark|average|median|range).*?(\d+\.?\d*%?\s*-\s*\d+\.?\d*%?)',
            # General patterns
            r'(\d+\.?\d*%?)\s*(?:is|as|the).*?' + kpi_term_lower,
            r'(\d+\.?\d*%?)\s*' + kpi_term_lower
        ]

        # Filter out None patterns
        patterns = [p for p in patterns if p]

        # Try each pattern
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                value_text = match.group(1).strip()

                # Check for range pattern
                if '-' in value_text:
                    return {"range": value_text, "value": None}
                else:
                    # Convert to float if possible, otherwise keep as string
                    try:
                        # Remove % if present
                        numeric_value = value_text.rstrip('%')
                        value = float(numeric_value)
                        if '%' in value_text:
                            value /= 100  # Convert percentage to decimal
                        return {"value": value, "range": None}
                    except ValueError:
                        return {"value": value_text, "range": None}

        # No pattern matched
        return {}


GEMINI_DAILY_LIMIT = 300
GEMINI_REQUEST_COUNT_FILE = os.path.join(os.path.dirname(__file__), 'gemini_request_count.json')
GEMINI_REQUEST_LOCK = threading.Lock()

def _get_today_str():
    return datetime.now().strftime('%Y-%m-%d')

def _load_gemini_request_count():
    if not os.path.exists(GEMINI_REQUEST_COUNT_FILE):
        return {"date": _get_today_str(), "count": 0}
    try:
        with open(GEMINI_REQUEST_COUNT_FILE, 'r') as f:
            data = json.load(f)
        if data.get("date") != _get_today_str():
            return {"date": _get_today_str(), "count": 0}
        return data
    except Exception:
        return {"date": _get_today_str(), "count": 0}

def _save_gemini_request_count(data):
    with open(GEMINI_REQUEST_COUNT_FILE, 'w') as f:
        json.dump(data, f)

class StartupKPIAgent:
    """
    An agent that analyzes startup KPIs and provides actionable insights using SWOT analysis
    powered by Google's Gemini 2.0 Flash API and web search for industry benchmarks.
    """

    def __init__(self, api_key=None):
        """
        Initialize the agent with the Google Gemini API.

        Args:
            api_key (str, optional): Google API key. If not provided, will look for
                                     GOOGLE_API_KEY environment variable.
        """
        # Load environment variables
        load_dotenv()

        # Set up API key
        if api_key is None:
            api_key = os.getenv("GOOGLE_API_KEY")
            if api_key is None:
                raise ValueError("API key must be provided or set as GOOGLE_API_KEY in .env file")

        # Configure the Gemini API
        genai.configure(api_key=api_key)

        # Set up the model configuration
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",  # Using Gemini 2.0 Flash
            generation_config={
                "temperature": 0.3,  # Slightly higher temperature for more creative insights
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 4096,
            },
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
        )

        # Initialize benchmark fetcher
        self.benchmark_fetcher = IndustryBenchmarkFetcher()

        # Initialize news and competitor cache
        self.news_cache = {}
        self.competitor_cache = {}
        self.cache_timestamp = None

    def _check_and_increment_gemini_request(self):
        with GEMINI_REQUEST_LOCK:
            data = _load_gemini_request_count()
            if data["date"] != _get_today_str():
                data = {"date": _get_today_str(), "count": 0}
            if data["count"] >= GEMINI_DAILY_LIMIT:
                return False
            data["count"] += 1
            _save_gemini_request_count(data)
            return True

    def _generate_content_with_limit(self, prompt):
        if not self._check_and_increment_gemini_request():
            raise Exception(f"Gemini API daily request limit ({GEMINI_DAILY_LIMIT}) reached. Please try again tomorrow.")
        return self.model.generate_content(prompt)

    def fetch_industry_news(self, industry: str, max_articles: int = 5) -> List[Dict[str, str]]:
        """
        Fetch recent news articles related to the startup's industry using RSS feeds.

        NOTE ON USAGE: This method accesses public RSS feeds which are designed for content
        distribution. However, always check the Terms of Service of each site before
        deploying in production. This implementation includes rate limiting and caching
        to minimize server impact. For educational/personal use only.

        Args:
            industry (str): The industry to fetch news for
            max_articles (int): Maximum number of articles to return

        Returns:
            List of news article dictionaries with 'title' and 'summary' keys
        """
        # Check if we have cached news that's less than 24 hours old
        current_time = datetime.now()
        if (self.cache_timestamp and
                (current_time - self.cache_timestamp).total_seconds() < 86400 and
                industry in self.news_cache):
            return self.news_cache[industry][:max_articles]

        # If no cache or cache expired, fetch new articles
        news_articles = []

        # List of RSS feeds for startup/tech news
        # Including global and India-specific sources
        rss_feeds = [
            # Global sources
            "https://feeds.feedburner.com/TechCrunch/",
            "https://news.ycombinator.com/rss",
            "https://www.techmeme.com/feed/",

            # India-specific sources
            "https://yourstory.com/feed/",  # YourStory RSS feed
            "https://inc42.com/feed/",  # Inc42 RSS feed
            "https://economictimes.indiatimes.com/small-biz/startups/rssfeeds/11993050.cms",  # ET StartupWorld

            # Dynamic search query
            f"https://news.google.com/rss/search?q={industry}+startup+india"  # India-focused search
        ]

        try:
            # Create a session with proper user agent for responsible access
            session = requests.Session()
            session.headers.update({
                'User-Agent': 'Mozilla/5.0 (compatible; StartupAnalyzer/0.1; Educational Project; +http://yourprojectwebsite.com/)',
                'Accept': 'application/rss+xml'
            })

            # Counter to limit total requests across all feeds
            total_requests = 0
            max_requests = 10  # Reasonable limit

            for feed_url in rss_feeds:
                # Rate limiting for responsible access
                if total_requests > 0:
                    time.sleep(2)  # 2-second delay between different RSS feeds

                total_requests += 1
                if total_requests > max_requests:
                    break

                # Use feedparser to fetch and parse the RSS feed
                feed = feedparser.parse(feed_url)

                for entry in feed.entries[:5]:  # Limit to top 5 entries per feed
                    # Check if article is relevant to the industry
                    if (industry.lower() in entry.title.lower() or
                            industry.lower() in getattr(entry, 'summary', '').lower()):

                        # Extract text safely with BeautifulSoup if HTML content
                        summary = entry.get('summary', '')
                        if summary and ('<' in summary and '>' in summary):
                            try:
                                summary = BeautifulSoup(summary, "html.parser").get_text()
                            except:
                                # Fallback if parsing fails
                                summary = summary[:200] + "..."

                        news_articles.append({
                            "title": entry.title,
                            "summary": summary[:200] + "..." if len(summary) > 200 else summary,
                            "date": entry.get('published', ''),
                            "source": feed_url.split('/')[2]  # Extract domain as source
                        })

                    if len(news_articles) >= max_articles:
                        break

                if len(news_articles) >= max_articles:
                    break

        except Exception as e:
            print(f"Error fetching news: {e}")
            # Return some generic insights if news fetching fails
            news_articles = [{
                "title": "News fetching failed",
                "summary": "Unable to retrieve current industry news. Working with existing knowledge.",
                "date": current_time.strftime("%Y-%m-%d"),
                "source": "system"
            }]

        # Update cache
        self.news_cache[industry] = news_articles
        self.cache_timestamp = current_time

        return news_articles[:max_articles]

    def fetch_competitor_info(self, industry: str, product_type: str) -> List[Dict[str, str]]:
        """
        Fetch information about potential competitors in the industry.
        In a real implementation, this would use a more robust data source.

        Args:
            industry (str): The industry to search for competitors
            product_type (str): Type of product/service

        Returns:
            List of competitor information dictionaries
        """
        cache_key = f"{industry}_{product_type}"

        # Check if we have cached competitor info
        current_time = datetime.now()
        if (self.cache_timestamp and
                (current_time - self.cache_timestamp).total_seconds() < 86400 * 7 and  # Cache for a week
                cache_key in self.competitor_cache):
            return self.competitor_cache[cache_key]

        # In a real implementation, this would use a more robust API or database
        # This is a mock implementation that uses the Gemini model to generate competitor insights
        try:
            prompt = f"""Generate information about 3 notable startups or companies in the {industry} industry 
            that focus on {product_type}. For each company, provide:
            1. Company name
            2. Brief description of their product/service (1-2 sentences)
            3. Key differentiator or unique selling proposition
            4. Founded year (approximate is fine)
            5. Current status (e.g., early-stage, growth, acquired)

            Format the response as a JSON array with these fields:
            [
                {{
                    "name": "Company Name",
                    "description": "Product description",
                    "differentiator": "Key differentiator",
                    "founded": "Year",
                    "status": "Current status"
                }},
                ...
            ]

            Only provide the JSON array with no other text or explanation.
            """

            response = self._generate_content_with_limit(prompt)

            # Extract JSON from the response
            response_text = response.text
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1

            if start_idx >= 0 and end_idx > start_idx:
                competitors = json.loads(response_text[start_idx:end_idx])
            else:
                raise ValueError("Could not find valid JSON array in response")

            # Cache the results
            self.competitor_cache[cache_key] = competitors
            return competitors

        except Exception as e:
            print(f"Error fetching competitor info: {e}")
            # Return generic competitor info if fetching fails
            return [
                {
                    "name": "Unknown Competitor",
                    "description": "Information unavailable due to data retrieval error",
                    "differentiator": "Unknown",
                    "founded": "Unknown",
                    "status": "Unknown"
                }
            ]

    def _prepare_kpi_analysis_with_benchmarks(self, company_data: Dict[str, Any], kpi_data: Dict[str, Any]) -> str:
        """
        Prepare KPI analysis by comparing with fetched industry benchmarks.

        Args:
            company_data (Dict): Company information
            kpi_data (Dict): KPI metrics data

        Returns:
            str: Analysis of KPIs compared to benchmarks
        """
        industry = company_data.get("industry", "Technology")
        stage = company_data.get("stage", "Early-stage")

        # Get benchmark data for each KPI
        benchmark_data = self.benchmark_fetcher.fetch_benchmarks_for_kpis(
            industry, stage, list(kpi_data.keys())
        )

        analysis = []

        # Go through each KPI and compare with benchmarks if available
        for kpi, value in kpi_data.items():
            kpi_info = f"{kpi}: {value}"

            if kpi in benchmark_data and (benchmark_data[kpi].get("value") is not None or
                                          benchmark_data[kpi].get("range") is not None):
                # Add benchmark information
                bench = benchmark_data[kpi]

                if bench.get("value") is not None:
                    benchmark_value = bench["value"]

                    # Check whether lower or higher is better for this KPI
                    if kpi in ["churn_rate", "burn_rate", "customer_churn_rate", "return_rate",
                               "order_fulfillment_time", "logistics_cost_per_unit"]:
                        # Lower is better for these metrics
                        if value < benchmark_value:
                            performance = "better than"
                            comparison = "lower than"
                        elif value > benchmark_value * 1.2:  # 20% worse
                            performance = "significantly worse than"
                            comparison = "higher than"
                        else:
                            performance = "close to"
                            comparison = "similar to"
                    else:
                        # Higher is better for most other metrics
                        if value > benchmark_value:
                            performance = "better than"
                            comparison = "higher than"
                        elif value < benchmark_value * 0.8:  # 20% worse
                            performance = "significantly worse than"
                            comparison = "lower than"
                        else:
                            performance = "close to"
                            comparison = "similar to"

                    kpi_info += f" ({performance} industry benchmark of {benchmark_value}, {comparison} average)"

                elif bench.get("range") is not None:
                    kpi_info += f" (industry benchmark range: {bench['range']})"

                # Add source if available
                if bench.get("source_title"):
                    source_url = bench.get("source_url", "")
                    if source_url:
                        kpi_info += f" | Source: {bench['source_title']} ({source_url})"
                    else:
                        kpi_info += f" | Source: {bench['source_title']}"

                    # Store URL in benchmark data for later citation use
                    bench["source_url"] = source_url
            else:
                kpi_info += " (no web benchmark data found)"

            analysis.append(kpi_info)

        return "\n".join(analysis)


    def generate_startup_insights(self, company_data: Dict[str, Any], kpi_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate startup-focused insights with SWOT analysis based on KPIs, company information,
        industry news and competitor data.

        Args:
            company_data (Dict): Information about the company (name, industry, stage, etc.)
            kpi_data (Dict): KPI metrics data

        Returns:
            Dict with generated insights including SWOT analysis and proper citations
        """
        # Get relevant industry news
        industry = company_data.get("industry", "Technology")
        industry_news = self.fetch_industry_news(industry)

        # Get competitor information
        product_type = company_data.get("product", "")
        competitors = self.fetch_competitor_info(industry, product_type)

        # Prepare KPI analysis with web-fetched benchmarks
        kpi_analysis = self._prepare_kpi_analysis_with_benchmarks(company_data, kpi_data)

        # Prepare the industry news as a string with proper citations
        news_str = "\n".join([
            f"- {article['title']}: {article['summary']} | Source: {article.get('source', 'Unknown')}, Date: {article.get('date', 'Unknown')}"
            for article in industry_news
        ])

        # Prepare competitor info as a string
        competitors_str = "\n".join([
            f"- {comp['name']}: {comp['description']} | Differentiator: {comp['differentiator']} | "
            f"Founded: {comp['founded']} | Status: {comp['status']}"
            for comp in competitors
        ])

        # Create a company info string
        company_info_str = "\n".join([f"{key}: {value}" for key, value in company_data.items()])

        # Format the user message with our data and instructions
        prompt = f"""You are an expert startup advisor with deep knowledge of KPIs, business metrics, and growth strategies.
        Analyze the provided company information, KPI data with benchmarks, recent industry news, and competitor 
        information to provide a strategic SWOT analysis specifically designed for early-stage startups in India.
        
        CRITICAL: Your responses MUST be relevant to the Indian startup ecosystem and infrastructure.

        Focus on:
        1. Creating a realistic and balanced SWOT analysis that acknowledges both positive aspects and challenges
        2. Providing specific, actionable growth tactics that are feasible for a small startup team based out of India
        3. Identifying market positioning and differentiation opportunities in India
        4. Linking KPI performance to specific business outcomes
        5. Finding practical competitive advantages based on strengths and market opportunities

        I've already compared the company's KPIs to available industry benchmarks. Please incorporate this analysis
        into your assessment while also applying your own knowledge of standard industry metrics.

        CRITICAL: When mentioning any insights based on news or external data, you MUST cite your sources using citation IDs 
        in square brackets like [citation1]. These will be converted to hyperlinks in the final output. Include these citations 
        directly inline with your content.

        Format your response as a JSON object with these sections:
        {{
            "executive_summary": "One paragraph executive summary with key insights",
            "swot_analysis": {{
                "strengths": ["List of 3-4 key internal strengths with brief explanations, with citations where applicable"],
                "weaknesses": ["List of 3-4 key internal weaknesses with brief explanations, with citations where applicable"],
                "opportunities": ["List of 3-4 external opportunities with brief explanations, with citations where applicable"],
                "threats": ["List of 3-4 external threats with brief explanations, with citations where applicable"]
            }},
            "growth_tactics": ["List of 4-5 specific, actionable growth tactics tailored for this startup, with citations where applicable"],
            "competitive_positioning": "Brief analysis of how the startup can position against competitors, with citations where applicable",
            "kpi_action_items": ["3-5 specific actions to improve underperforming KPIs or leverage strong KPIs, with citations where applicable"],
            "citations": [
                {{
                    "id": "citation1",  # Use consistent IDs that match the citations in the text
                    "source": "Source name (e.g. TechCrunch, YourStory)",
                    "title": "Article title",
                    "date": "Publication date",
                    "url": "Source URL if available"
                }}
            ]
        }}

        In the "citations" array, include all sources you referenced in your analysis. Make sure each citation has a unique ID 
        and include the URL if available - this will be used to create hyperlinks in the final output.

        Make sure your response is a valid JSON object. Do not include any text before or after the JSON.

        Company Information:
        {company_info_str}

        KPI Analysis with Web-Sourced Benchmarks:
        {kpi_analysis}

        Recent Industry News:
        {news_str}

        Competitor Information:
        {competitors_str}

        Consider the startup's stage ({company_data.get('stage', 'early-stage')}), technology readiness level 
        ({company_data.get('technology_readiness_level', 'unknown')}), and market segments 
        (TAM: {company_data.get('tam', 'unknown')}, SAM: {company_data.get('sam', 'unknown')}, 
        SOM: {company_data.get('som', 'unknown')}, Market CAGR: {company_data.get('market_cagr', 'unknown')}%) 
        when providing insights. Focus on practical actions that don't require significant resources 
        while delivering meaningful impact. Use the startup's elevator pitch to understand their value 
        proposition and market positioning.
        """

        # Generate insights
        try:
            response = self._generate_content_with_limit(prompt)

            # Parse the response as JSON
            try:
                # Extract JSON from the response text
                response_text = response.text

                # Sometimes the model returns extra text before or after the JSON
                # Try to extract just the JSON part
                start_idx = response_text.find('{')
                end_idx = response_text.rfind('}') + 1

                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response_text[start_idx:end_idx]
                    insights = json.loads(json_str)

                    # Make sure citations array exists
                    if "citations" not in insights:
                        insights["citations"] = []

                    # Add news sources to citations if not already there
                    existing_sources = {citation.get("source") for citation in insights["citations"]}

                    for article in industry_news:
                        source = article.get("source")
                        if source and source not in existing_sources:
                            insights["citations"].append({
                                "id": f"news_{len(insights['citations']) + 1}",
                                "source": source,
                                "title": article.get("title", "Unknown"),
                                "date": article.get("date", "Unknown"),
                                "url": ""  # URL not available in our implementation
                            })
                            existing_sources.add(source)

                    # Add benchmark sources to citations if not already there
                    for kpi, value in kpi_data.items():
                        benchmark_data = self.benchmark_fetcher.fetch_benchmarks_for_kpis(
                            company_data.get("industry", "Technology"),
                            company_data.get("stage", "Early-stage"),
                            [kpi]
                        ).get(kpi, {})

                        source_title = benchmark_data.get("source_title")
                        if source_title and source_title not in existing_sources:
                            insights["citations"].append({
                                "id": f"benchmark_{len(insights['citations']) + 1}",
                                "source": source_title,
                                "title": f"Benchmark data for {kpi}",
                                "date": "Retrieved " + datetime.now().strftime("%Y-%m-%d"),
                                "url": benchmark_data.get("source_url", "")
                            })
                            existing_sources.add(source_title)

                    return insights
                else:
                    raise ValueError("Could not find JSON in model response")

            except (json.JSONDecodeError, ValueError) as e:
                # If response isn't valid JSON, try to extract useful information
                print(f"Couldn't parse model response as JSON: {e}")
                return {
                    "executive_summary": "Analysis completed but formatting error occurred.",
                    "full_response": response.text,
                    "error": "JSON parsing failed"
                }

        except Exception as e:
            print(f"Error generating insights: {e}")
            return {
                "executive_summary": "Error generating insights",
                "error": str(e)
            }

    def render_insights_with_hyperlinks(self, insights: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the insights to ensure citation references remain as [citationX] for frontend hyperlinking.

        Args:
            insights (Dict): The generated insights

        Returns:
            Dict: The insights with citation references untouched (frontend will handle hyperlinks)
        """
        # No replacement of [citationX] with URLs; leave as-is for frontend
        return insights

    def save_insights(self, company_name: str, insights: Dict[str, Any]) -> str:
        """
        Save the generated insights to a file.

        Args:
            company_name (str): Name of the company
            insights (Dict): Generated insights

        Returns:
            str: Path to the saved file
        """
        # Create insights directory if it doesn't exist
        os.makedirs("insights", exist_ok=True)

        # Format filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"insights/{company_name.replace(' ', '_').lower()}_{timestamp}.json"

        # Save insights to file
        with open(filename, 'w') as f:
            json.dump(insights, f, indent=2)

        return filename