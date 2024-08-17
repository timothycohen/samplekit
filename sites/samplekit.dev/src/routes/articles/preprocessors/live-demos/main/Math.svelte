<script lang="ts">
	import Layout from './Layout.svelte';
</script>

<Layout title="Preprocessing Math">
	{#snippet write()}
		<div class="not-prose">
			<!-- shiki-start
t-katex-block
```latex
	\begin{align}
	\dot{x} & = \sigma(y-x) \\
	\dot{y} & = \rho x - y - xz \\
	\dot{z} & = -\beta z + xy
	\end{align}
```
shiki-end -->
		</div>
	{/snippet}

	{#snippet process()}
		<div class="not-prose">
			<!-- shiki-start
p c"[&>code]:overflow-auto [&>code]:h-96"
```html
<span class="katex-display">
	<span class="katex">
	<span class="katex-mathml">
	<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
	<semantics>
	<mtable rowspacing="0.25em" columnalign="right left" columnspacing="0em">
	<mtr>
	<mtd class="mtr-glue">

</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mover accent="true">
	<mi>x</mi>
	<mo>˙</mo>
</mover>
</mstyle>
</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mrow>
	<mrow>

</mrow>
	<mo>=</mo>
	<mi>σ</mi>
	<mo stretchy="false">(</mo>
	<mi>y</mi>
	<mo>−</mo>
	<mi>x</mi>
	<mo stretchy="false">)</mo>
</mrow>
</mstyle>
</mtd>
	<mtd class="mtr-glue">

</mtd>
	<mtd class="mml-eqn-num">

</mtd>
</mtr>
	<mtr>
	<mtd class="mtr-glue">

</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mover accent="true">
	<mi>y</mi>
	<mo>˙</mo>
</mover>
</mstyle>
</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mrow>
	<mrow>

</mrow>
	<mo>=</mo>
	<mi>ρ</mi>
	<mi>x</mi>
	<mo>−</mo>
	<mi>y</mi>
	<mo>−</mo>
	<mi>x</mi>
	<mi>z</mi>
</mrow>
</mstyle>
</mtd>
	<mtd class="mtr-glue">

</mtd>
	<mtd class="mml-eqn-num">

</mtd>
</mtr>
	<mtr>
	<mtd class="mtr-glue">

</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mover accent="true">
	<mi>z</mi>
	<mo>˙</mo>
</mover>
</mstyle>
</mtd>
	<mtd>
	<mstyle scriptlevel="0" displaystyle="true">
	<mrow>
	<mrow>

</mrow>
	<mo>=</mo>
	<mo>−</mo>
	<mi>β</mi>
	<mi>z</mi>
	<mo>+</mo>
	<mi>x</mi>
	<mi>y</mi>
</mrow>
</mstyle>
</mtd>
	<mtd class="mtr-glue">

</mtd>
	<mtd class="mml-eqn-num">

</mtd>
</mtr>
</mtable>
	<annotation encoding="application/x-tex">	begin&lbrace;align&rbrace;
	dot&lbrace;x&rbrace; &amp; = sigma(y-x) \
	dot&lbrace;y&rbrace; &amp; =
ho x - y - xz \
	dot&lbrace;z&rbrace; &amp; = -beta z + xy
	end&lbrace;align&rbrace;</annotation>
</semantics>
</math>
</span>
	<span class="katex-html" aria-hidden="true">
		<span class="base">
		<span class="strut" style="height:4.5em;vertical-align:-2em;">

	</span>
	<span class="mtable">
		<span class="col-align-r">
		<span class="vlist-t vlist-t2">
		<span class="vlist-r">
		<span class="vlist" style="height:2.5em;">
		<span style="top:-4.66em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord accent">
		<span class="vlist-t">
		<span class="vlist-r">
		<span class="vlist" style="height:0.6679em;">
		<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord mathnormal">x</span>
</span>
	<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="accent-body" style="left:-0.1111em;">
		<span class="mord">˙</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
	<span style="top:-3.16em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord accent">
		<span class="vlist-t vlist-t2">
		<span class="vlist-r">
		<span class="vlist" style="height:0.6679em;">
		<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord mathnormal" style="margin-right:0.03588em;">y</span>
</span>
	<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="accent-body" style="left:-0.0833em;">
		<span class="mord">˙</span>
</span>
</span>
</span>
	<span class="vlist-s">

	</span>
</span>
	<span class="vlist-r">
		<span class="vlist" style="height:0.1944em;">
		<span>

	</span>
</span>
</span>
</span>
</span>
</span>
</span>
	<span style="top:-1.66em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord accent">
		<span class="vlist-t">
		<span class="vlist-r">
		<span class="vlist" style="height:0.6679em;">
		<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord mathnormal" style="margin-right:0.04398em;">z</span>
</span>
	<span style="top:-3em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="accent-body" style="left:-0.0833em;">
		<span class="mord">˙</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
	<span class="vlist-s">

	</span>
</span>
	<span class="vlist-r">
		<span class="vlist" style="height:2em;">
		<span>

	</span>
</span>
</span>
</span>
</span>
	<span class="col-align-l">
		<span class="vlist-t vlist-t2">
		<span class="vlist-r">
		<span class="vlist" style="height:2.5em;">
		<span style="top:-4.66em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord">

	</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mrel">=</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mord mathnormal" style="margin-right:0.03588em;">σ</span>
	<span class="mopen">(</span>
	<span class="mord mathnormal" style="margin-right:0.03588em;">y</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mbin">−</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mord mathnormal">x</span>
	<span class="mclose">)</span>
</span>
</span>
	<span style="top:-3.16em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord">

	</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mrel">=</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mord mathnormal">ρ</span>
	<span class="mord mathnormal">x</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mbin">−</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mord mathnormal" style="margin-right:0.03588em;">y</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mbin">−</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mord mathnormal">x</span>
	<span class="mord mathnormal" style="margin-right:0.04398em;">z</span>
</span>
</span>
	<span style="top:-1.66em;">
		<span class="pstrut" style="height:3em;">

	</span>
	<span class="mord">
		<span class="mord">

	</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mrel">=</span>
	<span class="mspace" style="margin-right:0.2778em;">

	</span>
	<span class="mord">−</span>
	<span class="mord mathnormal" style="margin-right:0.05278em;">β</span>
	<span class="mord mathnormal" style="margin-right:0.04398em;">z</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mbin">+</span>
	<span class="mspace" style="margin-right:0.2222em;">

	</span>
	<span class="mord mathnormal">x</span>
	<span class="mord mathnormal" style="margin-right:0.03588em;">y</span>
</span>
</span>
</span>
	<span class="vlist-s">

	</span>
</span>
	<span class="vlist-r">
		<span class="vlist" style="height:2em;">
		<span>

	</span>
</span>
</span>
</span>
</span>
</span>
</span>
	<span class="tag">
		<span class="vlist-t vlist-t2">
		<span class="vlist-r">
		<span class="vlist" style="height:2.5em;">
		<span style="top:-4.5em;">
		<span class="pstrut" style="height:2.84em;">

	</span>
	<span class="eqn-num">

	</span>
</span>
	<span style="top:-3em;">
		<span class="pstrut" style="height:2.84em;">

	</span>
	<span class="eqn-num">

	</span>
</span>
	<span style="top:-1.5em;">
		<span class="pstrut" style="height:2.84em;">

	</span>
	<span class="eqn-num">

	</span>
</span>
</span>
	<span class="vlist-s">

	</span>
</span>
	<span class="vlist-r">
		<span class="vlist" style="height:2em;">
		<span>

	</span>
</span>
</span>
</span>
</span>
</span>
</span>
</span>
```
shiki-end -->
		</div>
	{/snippet}

	{#snippet render()}
		<div class="not-prose bg-code px-2">
			<!-- \[
	\begin{align}
	\dot{x} & = \sigma(y-x) \\
	\dot{y} & = \rho x - y - xz \\
	\dot{z} & = -\beta z + xy
	\end{align}
\] -->
		</div>
	{/snippet}
</Layout>
